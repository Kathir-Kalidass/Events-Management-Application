import mongoose from "mongoose";

const participantEventSchema = mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Registration approval status
    approved: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // coordinator who approved
    },

    approvedDate: {
      type: Date,
    },

    rejectionReason: {
      type: String,
    },

    // Attendance tracking
    attended: {
      type: Boolean,
      default: false,
    },

    attendanceMarkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // coordinator who marked attendance
    },

    attendanceMarkedDate: {
      type: Date,
    },

    // Feedback tracking
    feedbackGiven: {
      type: Boolean,
      default: false,
    },

    feedbackDate: {
      type: Date,
    },

    // Certificate tracking
    certificateGenerated: {
      type: Boolean,
      default: false,
    },

    certificateGeneratedDate: {
      type: Date,
    },

    // Registration details
    registrationDate: {
      type: Date,
      default: Date.now,
    },

    // Additional participant details for this event
    additionalInfo: {
      type: Map,
      of: String, // For storing custom form field responses
    },
  },
  {
    timestamps: true,
  }
);

const participantEvent = mongoose.model(
  "ParticipantEvent",
  participantEventSchema
);
export default participantEvent;