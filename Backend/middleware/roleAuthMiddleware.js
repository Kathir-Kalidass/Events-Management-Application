import User from "../models/userModel.js";

/**
 * Role-based authorization middleware
 * @param {Array|String} allowedRoles - Array of roles or single role that can access the route
 * @returns {Function} Middleware function
 */
export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by authMiddleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
        });
      }

      console.log(`✅ Role authorization passed for user: ${req.user.name} (${req.user.role})`);
      next();
    } catch (error) {
      console.error("❌ Role authorization error:", error);
      res.status(500).json({
        success: false,
        message: "Authorization error"
      });
    }
  };
};

/**
 * Resource ownership authorization middleware
 * Checks if the user owns the resource or has admin/hod privileges
 * @param {String} resourceModel - The model name to check ownership
 * @param {String} resourceIdParam - The parameter name containing the resource ID
 * @param {String} ownerField - The field in the resource that contains the owner ID (default: 'createdBy')
 * @returns {Function} Middleware function
 */
export const authorizeResourceOwnership = (resourceModel, resourceIdParam = 'id', ownerField = 'createdBy') => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Admin and HOD have access to all resources
      if (req.user.role === 'admin' || req.user.role === 'hod') {

        return next();
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: `Resource ID parameter '${resourceIdParam}' is required`
        });
      }

      // Dynamically import the model
      let Model;
      switch (resourceModel.toLowerCase()) {
        case 'event':
          const { default: Event } = await import('../models/eventModel.js');
          Model = Event;
          break;
        case 'user':
          Model = User;
          break;
        case 'participantevent':
          const { default: ParticipantEvent } = await import('../models/ParticipantEventModel.js');
          Model = ParticipantEvent;
          break;
        case 'feedback':
          const { default: Feedback } = await import('../models/feedbackModel.js');
          Model = Feedback;
          break;
        default:
          return res.status(500).json({
            success: false,
            message: `Unknown resource model: ${resourceModel}`
          });
      }

      // Find the resource
      const resource = await Model.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceModel} not found`
        });
      }

      // Check ownership
      const ownerId = resource[ownerField];
      if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have permission to access this ${resourceModel.toLowerCase()}`
        });
      }

      next();
    } catch (error) {
      console.error("❌ Resource ownership authorization error:", error);
      res.status(500).json({
        success: false,
        message: "Authorization error"
      });
    }
  };
};

/**
 * Participant self-access authorization
 * Ensures participants can only access their own data
 * @param {String} participantIdParam - The parameter name containing the participant ID
 * @returns {Function} Middleware function
 */
export const authorizeParticipantSelfAccess = (participantIdParam = 'participantId') => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Admin and HOD have access to all participant data
      if (req.user.role === 'admin' || req.user.role === 'hod') {

        return next();
      }

      // Coordinators can access participant data for their events
      if (req.user.role === 'coordinator') {

        return next();
      }

      // Participants can only access their own data
      if (req.user.role === 'participant') {
        const participantId = req.params[participantIdParam];
        if (!participantId) {
          return res.status(400).json({
            success: false,
            message: `Participant ID parameter '${participantIdParam}' is required`
          });
        }

        if (participantId !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: "Access denied. You can only access your own data"
          });
        }
      }

      next();
    } catch (error) {
      console.error("❌ Participant self-access authorization error:", error);
      res.status(500).json({
        success: false,
        message: "Authorization error"
      });
    }
  };
};

/**
 * Event coordinator authorization
 * Checks if the user is the coordinator of the specific event
 * @param {String} eventIdParam - The parameter name containing the event ID
 * @returns {Function} Middleware function
 */
export const authorizeEventCoordinator = (eventIdParam = 'eventId') => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Admin and HOD have access to all events
      if (req.user.role === 'admin' || req.user.role === 'hod') {

        return next();
      }

      // Check if user is a coordinator
      if (req.user.role !== 'coordinator') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Coordinator role required"
        });
      }

      const eventId = req.params[eventIdParam] || req.body[eventIdParam];
      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: `Event ID parameter '${eventIdParam}' is required`
        });
      }

      // Import Event model and check ownership
      const { default: Event } = await import('../models/eventModel.js');
      const event = await Event.findById(eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found"
        });
      }

      // Check if user is the coordinator of this event
      if (event.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You are not the coordinator of this event"
        });
      }

      next();
    } catch (error) {
      console.error("❌ Event coordinator authorization error:", error);
      res.status(500).json({
        success: false,
        message: "Authorization error"
      });
    }
  };
};

export default {
  authorizeRoles,
  authorizeResourceOwnership,
  authorizeParticipantSelfAccess,
  authorizeEventCoordinator
};