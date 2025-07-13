import asyncHandler from "express-async-handler";
import Certificate from "../models/certificateModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import ParticipantEvent from "../models/ParticipantEventModel.js";
import CertificateGenerationService from "../services/certificateGenerationService.js";

// Initialize certificate generation service
const certificateService = new CertificateGenerationService();

// Generate certificate
export const generateCertificate = asyncHandler(async (req, res) => {
  try {
    const { participantId, eventId } = req.body;
    const issuedBy = req.user._id;

    // Validate participant and event
    const participant = await User.findById(participantId);
    const event = await Event.findById(eventId);
    
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if participant is registered for the event
    const participantEvent = await ParticipantEvent.findOne({
      participantId,
      eventId,
    });

    if (!participantEvent) {
      return res.status(400).json({ 
        message: "Participant is not registered for this event" 
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      participantId,
      eventId,
    });

    if (existingCertificate) {
      return res.status(400).json({ 
        message: "Certificate already exists for this participant and event" 
      });
    }

    // Generate unique certificate ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    const certificateId = `CERT-${timestamp}-${random}`;

    // Get HOD and coordinator information
    const hodUser = await User.findOne({ role: "hod" });
    const coordinatorUser = await User.findById(event.createdBy);

    // Prepare certificate data
    const certificateData = {
      participantName: participant.name,
      eventTitle: event.title,
      eventDuration: event.duration || "1 Day",
      eventDates: {
        startDate: event.startDate,
        endDate: event.endDate,
      },
      venue: event.venue,
      mode: event.mode,
      issuedDate: new Date(),
      certificateId,
      skills: event.skills || [],
      hodName: hodUser?.name || process.env.DEPARTMENT_HEAD || "Dr. Department Head",
      coordinatorName: coordinatorUser?.name || "Program Coordinator"
    };

    // Generate certificate using the new service
    const certificateResults = await certificateService.generateCertificate(certificateData, ['pdf', 'image']);

    // Create certificate record
    const certificate = new Certificate({
      certificateId,
      participantId,
      eventId,
      participantName: participant.name,
      eventTitle: event.title,
      eventDuration: event.duration || "1 Day",
      eventDates: {
        startDate: event.startDate,
        endDate: event.endDate,
      },
      venue: event.venue,
      mode: event.mode,
      issuedBy,
      issuedDate: new Date(),
      template: {
        name: "enhanced-university-certificate",
        path: "services/certificateGenerationService.js",
        dimensions: {
          width: 1200,
          height: 900,
        },
      },
      verification: {
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-certificate/${certificateId}`,
        digitalSignature: Buffer.from(certificateId).toString("base64"),
        verified: true,
      },
      certificateData: {
        pdfBuffer: certificateResults.pdfBuffer,
        imageBuffer: certificateResults.imageBuffer,
        contentType: "application/pdf",
        fileName: `certificate-${certificateId}.pdf`,
        fileSize: certificateResults.pdfSize || certificateResults.imageSize,
      },
      status: "generated",
      skills: event.skills || [],
      metadata: {
        generationTime: Date.now() - timestamp,
        generatedOn: process.env.NODE_ENV || "development",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    // Add audit log entry
    certificate.auditLog.push({
      action: "created",
      performedBy: issuedBy,
      details: "Certificate generated",
      ipAddress: req.ip,
      timestamp: new Date(),
    });

    await certificate.save();

    // Update ParticipantEvent record
    await ParticipantEvent.findOneAndUpdate(
      { participantId, eventId },
      {
        certificateGenerated: true,
        certificateGeneratedDate: new Date(),
        certificateId: certificateId,
      }
    );

    res.status(201).json({
      message: "Certificate generated successfully",
      certificate: {
        id: certificate._id,
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        eventTitle: certificate.eventTitle,
        issuedDate: certificate.issuedDate,
        verificationUrl: certificate.verification.verificationUrl,
        status: certificate.status,
      },
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ 
      message: "Error generating certificate", 
      error: error.message 
    });
  }
});

// Bulk generate certificates for an event
export const bulkGenerateCertificates = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.body;
    const issuedBy = req.user._id;

    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get all participants for the event who have given feedback
    const participantEvents = await ParticipantEvent.find({
      eventId,
      feedbackGiven: true,
      certificateGenerated: false,
    }).populate("participantId");

    if (participantEvents.length === 0) {
      return res.status(400).json({ 
        message: "No eligible participants found for certificate generation" 
      });
    }

    const results = {
      successful: [],
      failed: [],
    };

    // Generate certificates for each participant
    for (const participantEvent of participantEvents) {
      try {
        const participant = participantEvent.participantId;
        
        // Generate unique certificate ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9).toUpperCase();
        const certificateId = `CERT-${timestamp}-${random}`;

        // Prepare certificate data
        const certificateData = {
          participantName: participant.name,
          eventTitle: event.title,
          eventDuration: event.duration || "1 Day",
          eventDates: {
            startDate: event.startDate,
            endDate: event.endDate,
          },
          venue: event.venue,
          issuedDate: new Date(),
          certificateId,
        };

        // Generate certificate image
        const certificateBuffer = await generateCertificateImage(certificateData);

        // Create certificate record
        const certificate = new Certificate({
          certificateId,
          participantId: participant._id,
          eventId,
          participantName: participant.name,
          eventTitle: event.title,
          eventDuration: event.duration || "1 Day",
          eventDates: {
            startDate: event.startDate,
            endDate: event.endDate,
          },
          venue: event.venue,
          mode: event.mode,
          issuedBy,
          issuedDate: new Date(),
          template: {
            name: "cream-bordered-appreciation",
            path: "template/Cream Bordered Appreciation Certificate.png",
            dimensions: {
              width: CERTIFICATE_CONFIG.template.width,
              height: CERTIFICATE_CONFIG.template.height,
            },
          },
          verification: {
            verificationUrl: `${process.env.FRONTEND_URL}/verify-certificate/${certificateId}`,
            digitalSignature: Buffer.from(certificateId).toString("base64"),
            verified: true,
          },
          certificateData: {
            imageBuffer: certificateBuffer,
            contentType: "image/png",
            fileName: `certificate-${certificateId}.png`,
            fileSize: certificateBuffer.length,
          },
          status: "generated",
          skills: event.skills || [],
          metadata: {
            generationTime: Date.now() - timestamp,
            generatedOn: process.env.NODE_ENV || "development",
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          },
        });

        // Add audit log entry
        certificate.auditLog.push({
          action: "created",
          performedBy: issuedBy,
          details: "Certificate generated via bulk operation",
          ipAddress: req.ip,
          timestamp: new Date(),
        });

        await certificate.save();

        // Update ParticipantEvent record
        await ParticipantEvent.findByIdAndUpdate(participantEvent._id, {
          certificateGenerated: true,
          certificateGeneratedDate: new Date(),
          certificateId: certificateId,
        });

        results.successful.push({
          participantId: participant._id,
          participantName: participant.name,
          certificateId: certificateId,
        });

      } catch (error) {
        console.error(`Error generating certificate for participant ${participantEvent.participantId._id}:`, error);
        results.failed.push({
          participantId: participantEvent.participantId._id,
          participantName: participantEvent.participantId.name,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      message: "Bulk certificate generation completed",
      results,
      summary: {
        total: participantEvents.length,
        successful: results.successful.length,
        failed: results.failed.length,
      },
    });
  } catch (error) {
    console.error("Error in bulk certificate generation:", error);
    res.status(500).json({ 
      message: "Error in bulk certificate generation", 
      error: error.message 
    });
  }
});

// Download certificate
export const downloadCertificate = asyncHandler(async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { format = 'pdf' } = req.query; // Allow format selection via query parameter

    const certificate = await Certificate.findOne({ certificateId })
      .populate("participantId", "name email")
      .populate("eventId", "title");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Check if user has permission to download
    const userId = req.user._id.toString();
    const participantId = certificate.participantId._id.toString();
    
    if (userId !== participantId && req.user.role !== "admin" && req.user.role !== "coordinator") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Record download
    await certificate.recordDownload(req.user._id, req.ip);

    // Determine which buffer to send based on format
    let buffer, contentType, fileName;
    
    if (format === 'pdf' && certificate.certificateData.pdfBuffer) {
      buffer = certificate.certificateData.pdfBuffer;
      contentType = "application/pdf";
      fileName = `certificate-${certificateId}.pdf`;
    } else if (format === 'image' && certificate.certificateData.imageBuffer) {
      buffer = certificate.certificateData.imageBuffer;
      contentType = "image/png";
      fileName = `certificate-${certificateId}.png`;
    } else {
      // Fallback to available format
      if (certificate.certificateData.pdfBuffer) {
        buffer = certificate.certificateData.pdfBuffer;
        contentType = "application/pdf";
        fileName = `certificate-${certificateId}.pdf`;
      } else if (certificate.certificateData.imageBuffer) {
        buffer = certificate.certificateData.imageBuffer;
        contentType = "image/png";
        fileName = `certificate-${certificateId}.png`;
      } else {
        return res.status(404).json({ message: "Certificate file not found" });
      }
    }

    // Set response headers
    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": buffer.length,
    });

    res.send(buffer);
  } catch (error) {
    console.error("Error downloading certificate:", error);
    res.status(500).json({ 
      message: "Error downloading certificate", 
      error: error.message 
    });
  }
});

// Get certificate details
export const getCertificate = asyncHandler(async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate("participantId", "name email")
      .populate("eventId", "title startDate endDate venue mode")
      .populate("issuedBy", "name email");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Check if user has permission to view
    const userId = req.user._id.toString();
    const participantId = certificate.participantId._id.toString();
    
    if (userId !== participantId && req.user.role !== "admin" && req.user.role !== "coordinator") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      certificate: {
        id: certificate._id,
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        eventTitle: certificate.eventTitle,
        eventDuration: certificate.eventDuration,
        eventDates: certificate.eventDates,
        venue: certificate.venue,
        mode: certificate.mode,
        issuedDate: certificate.issuedDate,
        issuedBy: certificate.issuedBy,
        status: certificate.status,
        verificationUrl: certificate.verification.verificationUrl,
        downloadCount: certificate.downloadCount,
        lastDownloaded: certificate.lastDownloaded,
        skills: certificate.skills,
        template: certificate.template,
      },
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({ 
      message: "Error fetching certificate", 
      error: error.message 
    });
  }
});

// Verify certificate
export const verifyCertificate = asyncHandler(async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.verifyCertificate(certificateId);

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message: "Certificate not found or has been revoked",
      });
    }

    res.status(200).json({
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        eventTitle: certificate.eventTitle,
        eventDuration: certificate.eventDuration,
        eventDates: certificate.eventDates,
        venue: certificate.venue,
        mode: certificate.mode,
        issuedDate: certificate.issuedDate,
        issuedBy: certificate.issuedBy,
        status: certificate.status,
        skills: certificate.skills,
      },
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({ 
      message: "Error verifying certificate", 
      error: error.message 
    });
  }
});

// Get certificates by participant
export const getCertificatesByParticipant = asyncHandler(async (req, res) => {
  try {
    const { participantId } = req.params;
    const userId = req.user._id.toString();

    // Check if user has permission to view
    if (userId !== participantId && req.user.role !== "admin" && req.user.role !== "coordinator") {
      return res.status(403).json({ message: "Access denied" });
    }

    const certificates = await Certificate.findByParticipant(participantId);

    res.status(200).json({
      certificates: certificates.map(cert => ({
        id: cert._id,
        certificateId: cert.certificateId,
        eventTitle: cert.eventTitle,
        eventDates: cert.eventDates,
        issuedDate: cert.issuedDate,
        status: cert.status,
        downloadCount: cert.downloadCount,
        verificationUrl: cert.verification.verificationUrl,
      })),
    });
  } catch (error) {
    console.error("Error fetching certificates by participant:", error);
    res.status(500).json({ 
      message: "Error fetching certificates", 
      error: error.message 
    });
  }
});

// Get certificates by event
export const getCertificatesByEvent = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const certificates = await Certificate.findByEvent(eventId);

    res.status(200).json({
      certificates: certificates.map(cert => ({
        id: cert._id,
        certificateId: cert.certificateId,
        participantName: cert.participantName,
        issuedDate: cert.issuedDate,
        status: cert.status,
        downloadCount: cert.downloadCount,
        participant: cert.participantId,
      })),
    });
  } catch (error) {
    console.error("Error fetching certificates by event:", error);
    res.status(500).json({ 
      message: "Error fetching certificates", 
      error: error.message 
    });
  }
});

// Update certificate template configuration
export const updateTemplateConfig = asyncHandler(async (req, res) => {
  try {
    const { templateConfig } = req.body;

    // Validate admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // Update the configuration (in a real application, you might store this in a database)
    // For now, we'll just return the current configuration
    res.status(200).json({
      message: "Template configuration updated successfully",
      config: CERTIFICATE_CONFIG,
    });
  } catch (error) {
    console.error("Error updating template configuration:", error);
    res.status(500).json({ 
      message: "Error updating template configuration", 
      error: error.message 
    });
  }
});

export default {
  generateCertificate,
  bulkGenerateCertificates,
  downloadCertificate,
  getCertificate,
  verifyCertificate,
  getCertificatesByParticipant,
  getCertificatesByEvent,
  updateTemplateConfig,
};