import asyncHandler from "express-async-handler";
import Event from "../../../shared/models/eventModel.js";
import ParticipantEvent from "../../../shared/models/ParticipantEventModel.js";
import Feedback from "../../../shared/models/feedbackModel.js";
import User from "../../../shared/models/userModel.js";
import mongoose from "mongoose";

// Get feedback statistics for an event
export const getEventFeedbackStats = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Verify event exists and user has permission
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    // Check permissions
    if (userRole === 'coordinator' && event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view feedback for this event"
      });
    }
    
    // Get all participant events for this event
    const participantEvents = await ParticipantEvent.find({ eventId })
      .populate('participantId', 'name email');
    
    // Get all feedback for this event
    const feedbacks = await Feedback.find({ eventId })
      .populate('participantId', 'name email');
    
    // Calculate statistics
    const totalParticipants = participantEvents.length;
    const approvedParticipants = participantEvents.filter(pe => pe.approved).length;
    const attendedParticipants = participantEvents.filter(pe => pe.attended).length;
    const feedbackGivenCount = participantEvents.filter(pe => pe.feedbackGiven).length;
    const certificatesGenerated = participantEvents.filter(pe => pe.certificateGenerated).length;
    
    // Calculate feedback response rate
    const feedbackResponseRate = attendedParticipants > 0 
      ? ((feedbackGivenCount / attendedParticipants) * 100).toFixed(2) 
      : 0;
    
    // Calculate certificate generation rate
    const certificateGenerationRate = feedbackGivenCount > 0 
      ? ((certificatesGenerated / feedbackGivenCount) * 100).toFixed(2) 
      : 0;
    
    // Define feedback questions with their text for better display
    const feedbackQuestions = {
      q7: {
        text: 'How effectively do you think the organization of this training programme facilitated a conducive learning environment and promoted active participation among participants?',
        type: 'rating'
      },
      q8: {
        text: 'How effectively did the resource persons communicate and engage with the participants to enhance their learning experience?',
        type: 'rating'
      },
      q9: {
        text: 'How well do you think the topics covered align with the current trends and challenges, and to what extent did they contribute to your professional development?',
        type: 'rating'
      },
      q10: {
        text: 'How effective was the presentation style in conveying the key concepts and fostering a dynamic learning environment for the participants?',
        type: 'rating'
      },
      q11: {
        text: 'Please provide an overall assessment of the program\'s overall effectiveness',
        type: 'rating'
      },
      q12: {
        text: 'How do you think the training programme could have been more effective? (In 2 lines)',
        type: 'text'
      },
      q13: {
        text: 'How satisfied were you overall?',
        type: 'rating'
      },
      q14: {
        text: 'Would you recommend the workshop to your colleagues or peers?',
        type: 'radio'
      },
      q15: {
        text: 'Which topics or aspects of the sessions did you find most interesting or useful?',
        type: 'text'
      }
    };

    // Analyze feedback responses
    const ratingAnalysis = {};
    const textResponses = {};
    
    if (feedbacks.length > 0) {
      Object.keys(feedbackQuestions).forEach(questionId => {
        const question = feedbackQuestions[questionId];
        
        if (question.type === 'rating') {
          const ratings = feedbacks
            .map(f => f[questionId])
            .filter(rating => rating !== undefined && rating !== null && !isNaN(rating))
            .map(rating => Number(rating));
          
          if (ratings.length > 0) {
            const sum = ratings.reduce((acc, rating) => acc + rating, 0);
            const average = (sum / ratings.length).toFixed(2);
            const distribution = {};
            
            // Count distribution of ratings (1-5 scale)
            for (let i = 1; i <= 5; i++) {
              distribution[i] = ratings.filter(r => r === i).length;
            }
            
            ratingAnalysis[questionId] = {
              questionText: question.text,
              average: parseFloat(average),
              totalResponses: ratings.length,
              distribution
            };
          }
        } else if (question.type === 'text') {
          const responses = feedbacks
            .map(f => f[questionId])
            .filter(response => response && response.trim().length > 0);
          
          textResponses[questionId] = {
            questionText: question.text,
            responses: responses,
            count: responses.length
          };
        } else if (question.type === 'radio') {
          const responses = feedbacks
            .map(f => f[questionId])
            .filter(response => response && response.trim().length > 0);
          
          const distribution = {};
          responses.forEach(response => {
            distribution[response] = (distribution[response] || 0) + 1;
          });
          
          ratingAnalysis[questionId] = {
            questionText: question.text,
            type: 'radio',
            distribution: distribution,
            count: responses.length
          };
        }
      });
    }
    
    // Get participants who haven't given feedback yet
    const participantsWithoutFeedback = participantEvents
      .filter(pe => pe.attended && !pe.feedbackGiven)
      .map(pe => ({
        participantId: pe.participantId._id,
        name: pe.participantId.name,
        email: pe.participantId.email,
        attendanceDate: pe.attendanceMarkedDate
      }));
    
    // Get participants eligible for certificates
    const participantsEligibleForCertificates = participantEvents
      .filter(pe => pe.feedbackGiven && !pe.certificateGenerated)
      .map(pe => ({
        participantId: pe.participantId._id,
        name: pe.participantId.name,
        email: pe.participantId.email,
        feedbackDate: pe.feedbackDate
      }));
    
    // Overall feedback summary
    const overallRating = Object.keys(ratingAnalysis).length > 0
      ? (Object.values(ratingAnalysis).reduce((sum, analysis) => sum + analysis.average, 0) / Object.keys(ratingAnalysis).length).toFixed(2)
      : 0;
    
    res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate
      },
      statistics: {
        totalParticipants,
        approvedParticipants,
        attendedParticipants,
        feedbackGivenCount,
        certificatesGenerated,
        feedbackResponseRate: parseFloat(feedbackResponseRate),
        certificateGenerationRate: parseFloat(certificateGenerationRate),
        overallRating: parseFloat(overallRating)
      },
      ratingAnalysis,
      textResponses,
      participantsWithoutFeedback,
      participantsEligibleForCertificates,
      feedbackCount: feedbacks.length
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message
    });
  }
});

// Get detailed feedback responses for an event
export const getEventFeedbackDetails = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Verify event exists and user has permission
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    // Check permissions
    if (userRole === 'coordinator' && event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view feedback for this event"
      });
    }
    
    // Get all feedback for this event with participant details
    const feedbacks = await Feedback.find({ eventId })
      .populate('participantId', 'name email department')
      .sort({ createdAt: -1 });
    
    // Format feedback responses
    const formattedFeedbacks = feedbacks.map(feedback => ({
      _id: feedback._id,
      participant: {
        name: feedback.participantId.name,
        email: feedback.participantId.email,
        department: feedback.participantId.department
      },
      responses: {
        q7: feedback.q7,
        q8: feedback.q8,
        q9: feedback.q9,
        q10: feedback.q10,
        q11: feedback.q11,
        q12: feedback.q12,
        q13: feedback.q13,
        q14: feedback.q14,
        q15: feedback.q15
      },
      submittedAt: feedback.createdAt
    }));
    
    res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title
      },
      feedbacks: formattedFeedbacks,
      totalCount: formattedFeedbacks.length
    });
  } catch (error) {
    console.error('Error fetching feedback details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback details',
      error: error.message
    });
  }
});

// Get feedback statistics for all events (for HOD dashboard)
export const getAllEventsFeedbackStats = asyncHandler(async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Only HOD and admin can access all events stats
    if (userRole !== 'hod' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. HOD or Admin role required"
      });
    }
    
    // Get all events
    const events = await Event.find({})
      .populate('createdBy', 'name')
      .sort({ startDate: -1 });
    
    const eventStats = [];
    
    for (const event of events) {
      // Get participant events for this event
      const participantEvents = await ParticipantEvent.find({ eventId: event._id });
      
      // Calculate basic stats
      const totalParticipants = participantEvents.length;
      const attendedParticipants = participantEvents.filter(pe => pe.attended).length;
      const feedbackGivenCount = participantEvents.filter(pe => pe.feedbackGiven).length;
      const certificatesGenerated = participantEvents.filter(pe => pe.certificateGenerated).length;
      
      const feedbackResponseRate = attendedParticipants > 0 
        ? ((feedbackGivenCount / attendedParticipants) * 100).toFixed(2) 
        : 0;
      
      eventStats.push({
        eventId: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        coordinator: event.createdBy.name,
        status: event.status,
        statistics: {
          totalParticipants,
          attendedParticipants,
          feedbackGivenCount,
          certificatesGenerated,
          feedbackResponseRate: parseFloat(feedbackResponseRate)
        }
      });
    }
    
    // Calculate overall statistics
    const overallStats = {
      totalEvents: events.length,
      totalParticipants: eventStats.reduce((sum, stat) => sum + stat.statistics.totalParticipants, 0),
      totalAttended: eventStats.reduce((sum, stat) => sum + stat.statistics.attendedParticipants, 0),
      totalFeedbackGiven: eventStats.reduce((sum, stat) => sum + stat.statistics.feedbackGivenCount, 0),
      totalCertificatesGenerated: eventStats.reduce((sum, stat) => sum + stat.statistics.certificatesGenerated, 0)
    };
    
    overallStats.averageFeedbackRate = overallStats.totalAttended > 0 
      ? ((overallStats.totalFeedbackGiven / overallStats.totalAttended) * 100).toFixed(2)
      : 0;
    
    res.status(200).json({
      success: true,
      overallStats,
      eventStats
    });
  } catch (error) {
    console.error('Error fetching all events feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message
    });
  }
});

export default {
  getEventFeedbackStats,
  getEventFeedbackDetails,
  getAllEventsFeedbackStats
};