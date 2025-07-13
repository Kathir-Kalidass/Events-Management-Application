import asyncHandler from "express-async-handler";
import Event from "../../models/eventModel.js";
import ParticipantEvent from "../../models/ParticipantEventModel.js";
import Feedback from "../../models/feedbackModel.js";
import User from "../../models/userModel.js";
import Certificate from "../../models/certificateModel.js";
import mongoose from "mongoose";

// Get all events
export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Register for an event
export const registerEvent = asyncHandler(async (req, res) => {
  const { participantId, eventId } = req.body;
  
  // Authorization: Participants can only register themselves
  if (req.user.role === 'participant' && participantId !== req.user._id.toString()) {
    return res.status(403).json({ 
      success: false,
      message: "You can only register yourself for events" 
    });
  }
  
  const exists = await ParticipantEvent.findOne({ participantId, eventId });
  if (exists) {
    res.status(400).json({ message: "Already registered" });
    return;
  }
  const registration = await ParticipantEvent.create({ participantId, eventId, attended: false, feedbackGiven: false });
  res.status(201).json(registration);
});

// Get participant's events
export const getMyEvents = asyncHandler(async (req, res) => {
  const { participantId } = req.params;
  const myEvents = await ParticipantEvent.find({ participantId })
    .populate("eventId")
    .populate("participantId");
  res.json(myEvents);
});

// Get all participant events (for HOD dashboard)
export const getAllMyEvents = asyncHandler(async (req, res) => {
  try {
    const allEvents = await ParticipantEvent.find({})
      .populate("eventId")
      .populate("participantId");
    res.json(allEvents);
  } catch (error) {
    console.error("Error fetching all participant events:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get participant's certificates (assuming certificates are part of ParticipantEvent)
export const getMyCertificates = async (req, res) => {
  try {
    const { participantId } = req.params;

    // Find all events where participant attended and gave feedback
    const eligible = await ParticipantEvent.find({
      participantId,
      attended: true, 
      feedbackGiven: true
    }).populate("eventId");

    // Map to clean response
    const certificates = eligible.map(record => ({
      eventId: record.eventId._id,
      title: record.eventId.title,
      startDate: record.eventId.startDate,
      endDate: record.eventId.endDate
    }));

    res.status(200).json(certificates);

  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get feedback questions
export const getFeedbackQuestions = asyncHandler(async (req, res) => {
  try {
    const feedbackQuestions = [
      {
        id: 'q7',
        question: 'How effectively do you think the organization of this training programme facilitated a conducive learning environment and promoted active participation among participants?',
        type: 'rating',
        required: true
      },
      {
        id: 'q8',
        question: 'How effectively did the resource persons communicate and engage with the participants to enhance their learning experience?',
        type: 'rating',
        required: true
      },
      {
        id: 'q9',
        question: 'How well do you think the topics covered align with the current trends and challenges, and to what extent did they contribute to your professional development?',
        type: 'rating',
        required: true
      },
      {
        id: 'q10',
        question: 'How effective was the presentation style in conveying the key concepts and fostering a dynamic learning environment for the participants?',
        type: 'rating',
        required: true
      },
      {
        id: 'q11',
        question: 'Please provide an overall assessment of the program\'s overall effectiveness',
        type: 'rating',
        required: true
      },
      {
        id: 'q12',
        question: 'How do you think the training programme could have been more effective? (In 2 lines)',
        type: 'text',
        multiline: true,
        rows: 2,
        required: true
      },
      {
        id: 'q13',
        question: 'How satisfied were you overall?',
        type: 'rating',
        required: true
      },
      {
        id: 'q14',
        question: 'Would you recommend the workshop to your colleagues or peers?',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        id: 'q15',
        question: 'Which topics or aspects of the sessions did you find most interesting or useful?',
        type: 'text',
        multiline: true,
        rows: 3,
        required: true
      }
    ];

    res.status(200).json({
      success: true,
      questions: feedbackQuestions,
      totalCount: feedbackQuestions.length
    });
  } catch (error) {
    console.error("Error fetching feedback questions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback questions",
      error: error.message
    });
  }
});

// Submit feedback
export const giveFeedback = asyncHandler(async (req, res) => {
  try {
    const { 
      participantId, 
      eventId, 
      email, 
      name, 
      designation, 
      institute, 
      contact, 
      responses,
      // Legacy fields for backward compatibility
      q7, q8, q9, q10, q11, q12, q13, q14, q15 
    } = req.body;
    
    console.log("Received participantId:", participantId, "eventId:", eventId);

    // Validate required fields
    if (!participantId || !eventId || !email || !name || !designation || !institute || !contact) {
      return res.status(400).json({ message: "All personal information fields are required" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(participantId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid participantId or eventId" });
    }

    // Check if participant is registered and attended the event
    const participantEvent = await ParticipantEvent.findOne({ participantId, eventId });
    if (!participantEvent) {
      return res.status(404).json({ message: "Participant not registered for this event" });
    }

    if (!participantEvent.attended) {
      return res.status(400).json({ message: "Cannot submit feedback for events you haven't attended" });
    }

    if (participantEvent.feedbackGiven) {
      return res.status(400).json({ message: "Feedback already submitted for this event" });
    }

    // Prepare feedback data
    let feedbackData = {
      participantId, 
      eventId, 
      email, 
      name, 
      designation, 
      institute, 
      contact,
      submissionSource: 'web',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // Handle dynamic responses or legacy format
    if (responses && typeof responses === 'object') {
      feedbackData.responses = new Map(Object.entries(responses));
      
      // Calculate overall rating from rating responses
      const ratingResponses = Object.values(responses).filter(val => typeof val === 'number' && val >= 1 && val <= 5);
      if (ratingResponses.length > 0) {
        feedbackData.overallRating = Math.round(ratingResponses.reduce((sum, val) => sum + val, 0) / ratingResponses.length);
      }
    } else {
      // Legacy format - validate all questions are answered
      if (!q7 || !q8 || !q9 || !q10 || !q11 || !q12 || !q13 || !q14 || !q15) {
        return res.status(400).json({ message: "All feedback questions must be answered" });
      }

      // Store legacy responses
      feedbackData = {
        ...feedbackData,
        q7, q8, q9, q10, q11, q12, q13, q14, q15,
        responses: new Map([
          ['q7', q7], ['q8', q8], ['q9', q9], ['q10', q10], ['q11', q11],
          ['q12', q12], ['q13', q13], ['q14', q14], ['q15', q15]
        ]),
        overallRating: Math.round((q7 + q8 + q9 + q10 + q11 + q13) / 6)
      };
    }

    // Create feedback
    const feedback = await Feedback.create(feedbackData);

    // Update ParticipantEvent to mark feedback as given
    await ParticipantEvent.findOneAndUpdate(
      { participantId, eventId }, 
      { 
        feedbackGiven: true,
        feedbackDate: new Date()
      }
    );

    // Generate certificate after feedback submission
    const certificate = await generateCertificate(participantId, eventId, name);

    res.status(201).json({
      feedback,
      certificate,
      message: "Feedback submitted successfully! Your certificate has been generated."
    });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(400).json({ message: err.message || "Failed to submit feedback" });
  }
});

// Generate certificate after feedback submission
const generateCertificate = async (participantId, eventId, participantName) => {
  try {
    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get participant details
    const participant = await User.findById(participantId);
    if (!participant) {
      throw new Error("Participant not found");
    }

    // Check if certificate already exists in the new Certificate model
    const existingCertificate = await Certificate.findOne({
      participantId,
      eventId,
    });

    if (existingCertificate) {
      console.log("Certificate already exists in new model");
      return {
        certificateId: existingCertificate.certificateId,
        participantName: existingCertificate.participantName,
        eventTitle: existingCertificate.eventTitle,
        issuedDate: existingCertificate.issuedDate,
        verified: true,
        skills: existingCertificate.skills || [],
        description: `Certificate of completion for ${existingCertificate.eventTitle}`
      };
    }

    // Generate unique certificate ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    const certificateId = `CERT-${timestamp}-${random}`;

    // Import the certificate generation function from the certificate controller
    const sharp = await import('sharp');
    const QRCode = await import('qrcode');
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Certificate template configuration
    const CERTIFICATE_CONFIG = {
      template: {
        path: path.join(__dirname, "../../template/Cream Bordered Appreciation Certificate.png"),
        width: 1200,
        height: 900,
      },
      text: {
        participantName: {
          x: 600,
          y: 380,
          fontSize: 48,
          fontFamily: "Arial",
          color: "#2C3E50",
          align: "center",
          weight: "bold",
        },
        eventTitle: {
          x: 600,
          y: 480,
          fontSize: 32,
          fontFamily: "Arial",
          color: "#34495E",
          align: "center",
          weight: "normal",
        },
        eventDuration: {
          x: 600,
          y: 530,
          fontSize: 24,
          fontFamily: "Arial",
          color: "#7F8C8D",
          align: "center",
          weight: "normal",
        },
        eventDates: {
          x: 600,
          y: 580,
          fontSize: 20,
          fontFamily: "Arial",
          color: "#7F8C8D",
          align: "center",
          weight: "normal",
        },
        venue: {
          x: 600,
          y: 620,
          fontSize: 18,
          fontFamily: "Arial",
          color: "#7F8C8D",
          align: "center",
          weight: "normal",
        },
        issuedDate: {
          x: 200,
          y: 780,
          fontSize: 16,
          fontFamily: "Arial",
          color: "#7F8C8D",
          align: "left",
          weight: "normal",
        },
        certificateId: {
          x: 1000,
          y: 780,
          fontSize: 16,
          fontFamily: "Arial",
          color: "#7F8C8D",
          align: "right",
          weight: "normal",
        },
      },
      qrCode: {
        x: 1050,
        y: 50,
        size: 100,
      },
    };

    // Generate QR Code for certificate verification
    const generateQRCode = async (certificateId) => {
      try {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate/${certificateId}`;
        const qrCodeBuffer = await QRCode.default.toBuffer(verificationUrl, {
          type: "png",
          width: CERTIFICATE_CONFIG.qrCode.size,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        return qrCodeBuffer;
      } catch (error) {
        console.error("Error generating QR code:", error);
        throw error;
      }
    };

    // Create SVG text element for overlaying on image
    const createTextSVG = (text, config) => {
      const { x, y, fontSize, color, align, weight } = config;
      
      let textAnchor = "middle";
      if (align === "left") textAnchor = "start";
      if (align === "right") textAnchor = "end";
      
      return `
        <text x="${x}" y="${y}" 
              font-family="Arial, sans-serif" 
              font-size="${fontSize}" 
              font-weight="${weight}" 
              fill="${color}" 
              text-anchor="${textAnchor}"
              dominant-baseline="middle">
          ${text}
        </text>
      `;
    };

    // Generate certificate image with text overlay
    const generateCertificateImage = async (certificateData) => {
      try {
        const {
          participantName,
          eventTitle,
          eventDuration,
          eventDates,
          venue,
          issuedDate,
          certificateId,
        } = certificateData;

        // Read the template image
        const templateBuffer = fs.default.readFileSync(CERTIFICATE_CONFIG.template.path);
        
        // Generate QR code
        const qrCodeBuffer = await generateQRCode(certificateId);
        
        // Format dates
        const startDate = new Date(eventDates.startDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const endDate = new Date(eventDates.endDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
        
        const issuedDateFormatted = new Date(issuedDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Create SVG overlay with all text elements
        const svgOverlay = `
          <svg width="${CERTIFICATE_CONFIG.template.width}" height="${CERTIFICATE_CONFIG.template.height}">
            ${createTextSVG(participantName, CERTIFICATE_CONFIG.text.participantName)}
            ${createTextSVG(eventTitle, CERTIFICATE_CONFIG.text.eventTitle)}
            ${createTextSVG(eventDuration || "1 Day", CERTIFICATE_CONFIG.text.eventDuration)}
            ${createTextSVG(dateRange, CERTIFICATE_CONFIG.text.eventDates)}
            ${createTextSVG(venue, CERTIFICATE_CONFIG.text.venue)}
            ${createTextSVG(`Issued: ${issuedDateFormatted}`, CERTIFICATE_CONFIG.text.issuedDate)}
            ${createTextSVG(`ID: ${certificateId}`, CERTIFICATE_CONFIG.text.certificateId)}
          </svg>
        `;

        // Composite the image with text overlay and QR code
        const certificateBuffer = await sharp.default(templateBuffer)
          .composite([
            {
              input: Buffer.from(svgOverlay),
              top: 0,
              left: 0,
            },
            {
              input: qrCodeBuffer,
              top: CERTIFICATE_CONFIG.qrCode.y,
              left: CERTIFICATE_CONFIG.qrCode.x,
            },
          ])
          .png()
          .toBuffer();

        return certificateBuffer;
      } catch (error) {
        console.error("Error generating certificate image:", error);
        throw error;
      }
    };

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
    let certificateBuffer;
    try {
      certificateBuffer = await generateCertificateImage(certificateData);
    } catch (imageError) {
      console.error("Error generating certificate image, proceeding without image:", imageError);
      certificateBuffer = null;
    }

    // Create certificate record in the new Certificate model
    const newCertificate = new Certificate({
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
      issuedBy: participantId, // For feedback-generated certificates, we can use participant as issuer
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
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate/${certificateId}`,
        digitalSignature: Buffer.from(certificateId).toString("base64"),
        verified: true,
      },
      certificateData: certificateBuffer ? {
        imageBuffer: certificateBuffer,
        contentType: "image/png",
        fileName: `certificate-${certificateId}.png`,
        fileSize: certificateBuffer.length,
      } : undefined,
      status: "generated",
      skills: event.skills || [],
      metadata: {
        generationTime: Date.now() - timestamp,
        generatedOn: process.env.NODE_ENV || "development",
        ipAddress: "127.0.0.1", // Default for feedback submissions
      },
    });

    // Add audit log entry
    newCertificate.auditLog.push({
      action: "created",
      performedBy: participantId,
      details: "Certificate generated after feedback submission",
      ipAddress: "127.0.0.1",
      timestamp: new Date(),
    });

    await newCertificate.save();

    // Also update ParticipantEvent with certificate info for backward compatibility
    await ParticipantEvent.findOneAndUpdate(
      { participantId, eventId },
      { 
        certificateGenerated: true,
        certificateGeneratedDate: new Date(),
        certificateId: certificateId
      }
    );

    console.log("Certificate generated successfully:", certificateId);

    return {
      certificateId,
      participantName: participant.name,
      eventTitle: event.title,
      issuedDate: new Date(),
      verified: true,
      skills: event.skills || [],
      description: `Certificate of completion for ${event.title}`
    };
  } catch (error) {
    console.error("Error generating certificate:", error);
    
    // Fallback to old method if new method fails
    const fallbackCertificate = {
      participantId,
      eventId,
      participantName,
      eventTitle: event?.title || "Unknown Event",
      issuedDate: new Date(),
      certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      verified: true,
      skills: event?.skills || [],
      description: `Certificate of completion for ${event?.title || "Unknown Event"}`
    };

    // Update ParticipantEvent with certificate info
    await ParticipantEvent.findOneAndUpdate(
      { participantId, eventId },
      { 
        certificateGenerated: true,
        certificateGeneratedDate: new Date(),
        certificateId: fallbackCertificate.certificateId
      }
    );

    return fallbackCertificate;
  }
};

// Get participant's certificates
export const getCertificates = asyncHandler(async (req, res) => {
  try {
    const { participantId } = req.params;

    // Get certificates from the new Certificate model only
    const certificates = await Certificate.findByParticipant(participantId);

    // Convert certificates to the expected format
    const formattedCertificates = certificates.map(cert => ({
      _id: cert._id,
      participantId: cert.participantId,
      eventId: cert.eventId._id,
      title: `Certificate of Completion - ${cert.eventTitle}`,
      eventTitle: cert.eventTitle,
      issuedDate: cert.issuedDate,
      certificateId: cert.certificateId,
      verified: cert.verification?.verified || true,
      skills: cert.skills || [],
      description: `Certificate of completion for ${cert.eventTitle}`,
      status: cert.status,
      downloadCount: cert.downloadCount || 0,
      eventDates: cert.eventDates,
      venue: cert.venue,
      mode: cert.mode
    }));

    // Sort by issued date (newest first)
    formattedCertificates.sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));

    res.status(200).json(formattedCertificates);
  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Download certificate
export const downloadCertificate = asyncHandler(async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    // Find the participant event record
    const participantEvent = await ParticipantEvent.findById(certificateId)
      .populate("eventId")
      .populate("participantId");

    if (!participantEvent || !participantEvent.certificateGenerated) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Generate PDF certificate (you would implement actual PDF generation here)
    // For now, return certificate data
    const certificateData = {
      participantName: participantEvent.participantId.name,
      eventTitle: participantEvent.eventId.title,
      issuedDate: participantEvent.certificateGeneratedDate,
      certificateId: participantEvent.certificateId
    };

    res.status(200).json({
      message: "Certificate ready for download",
      certificate: certificateData
    });
  } catch (err) {
    console.error("Error downloading certificate:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Verify certificate
export const verifyCertificate = asyncHandler(async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const participantEvent = await ParticipantEvent.findOne({ 
      certificateId: certificateId 
    }).populate("eventId").populate("participantId");

    if (!participantEvent) {
      return res.status(404).json({ 
        valid: false, 
        message: "Certificate not found" 
      });
    }

    res.status(200).json({
      valid: true,
      certificate: {
        participantName: participantEvent.participantId.name,
        eventTitle: participantEvent.eventId.title,
        issuedDate: participantEvent.certificateGeneratedDate,
        certificateId: participantEvent.certificateId
      }
    });
  } catch (err) {
    console.error("Error verifying certificate:", err);
    res.status(500).json({ 
      valid: false, 
      message: "Server Error" 
    });
  }
});

// Get recent activity
export const getRecentActivity = asyncHandler(async (req, res) => {
  try {
    const { participantId } = req.params;

    const activities = [];

    // Get recent registrations
    const recentRegistrations = await ParticipantEvent.find({ participantId })
      .populate("eventId")
      .sort({ createdAt: -1 })
      .limit(10);

    recentRegistrations.forEach(pe => {
      activities.push({
        type: 'registration',
        description: `Registered for ${pe.eventId.title}`,
        date: pe.createdAt
      });

      if (pe.attended) {
        activities.push({
          type: 'attendance',
          description: `Attended ${pe.eventId.title}`,
          date: pe.attendanceMarkedDate || pe.createdAt
        });
      }

      if (pe.feedbackGiven) {
        activities.push({
          type: 'feedback',
          description: `Submitted feedback for ${pe.eventId.title}`,
          date: pe.feedbackDate || pe.createdAt
        });
      }
    });

    // Get certificates from the new Certificate model only
    const certificates = await Certificate.find({ participantId })
      .populate("eventId")
      .sort({ issuedDate: -1 })
      .limit(10);

    certificates.forEach(cert => {
      activities.push({
        type: 'certificate',
        description: `Earned certificate for ${cert.eventTitle}`,
        date: cert.issuedDate
      });
    });

    // Sort by date and return latest activities
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(activities.slice(0, 10));
  } catch (err) {
    console.error("Error fetching recent activity:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get notifications
export const getNotifications = asyncHandler(async (req, res) => {
  try {
    const { participantId } = req.params;

    const notifications = [];

    // Check for pending feedback
    const pendingFeedback = await ParticipantEvent.find({
      participantId,
      attended: true,
      feedbackGiven: false
    }).populate("eventId");

    pendingFeedback.forEach(pe => {
      notifications.push({
        type: 'feedback_pending',
        title: 'Feedback Required',
        message: `Submit feedback for "${pe.eventId.title}" to earn your certificate`,
        eventId: pe.eventId._id,
        date: new Date(),
        read: false
      });
    });

    // Check for upcoming events
    const upcomingEvents = await ParticipantEvent.find({
      participantId,
      approved: true
    }).populate("eventId");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    upcomingEvents.forEach(pe => {
      const eventDate = new Date(pe.eventId.startDate);
      if (eventDate <= tomorrow && eventDate > new Date()) {
        notifications.push({
          type: 'event_reminder',
          title: 'Event Reminder',
          message: `"${pe.eventId.title}" is starting soon!`,
          eventId: pe.eventId._id,
          date: new Date(),
          read: false
        });
      }
    });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update participant profile
export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const { participantId } = req.params;
    const { name, email, phone, department, institution, designation, dateOfBirth } = req.body;

    // Find user by ID
    const user = await User.findById(participantId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (institution) user.institution = institution;
    if (designation) user.designation = designation;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();

    // Return updated user (excluding password)
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      institution: user.institution,
      designation: user.designation,
      dateOfBirth: user.dateOfBirth,
      role: user.role
    };

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update notification preferences
export const updatePreferences = asyncHandler(async (req, res) => {
  try {
    const { participantId } = req.params;
    const preferences = req.body;

    // Find user by ID
    const user = await User.findById(participantId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update preferences (you might want to add a preferences field to User model)
    user.preferences = preferences;
    await user.save();

    res.status(200).json({ message: "Preferences updated successfully" });
  } catch (err) {
    console.error("Error updating preferences:", err);
    res.status(500).json({ message: "Server Error" });
  }
});