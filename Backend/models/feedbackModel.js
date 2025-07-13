import mongoose from "mongoose";

// Old model commented out for reference
/*
const feedbackSchema = mongoose.Schema(
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
    rating: {
      type: Number,
      default: 0,
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const feedback = mongoose.model("Feedback", feedbackSchema);
export default feedback;
*/

// Enhanced feedback model with dynamic responses
const feedbackSchema = mongoose.Schema(
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

    // Personal Information
    email: { type: String, required: true },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    institute: { type: String, required: true },
    contact: { type: String, required: true },

    // Dynamic feedback responses
    responses: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Can store strings, numbers, arrays
      required: true
    },

    // Legacy fields for backward compatibility
    q7: { type: Number },
    q8: { type: Number },
    q9: { type: Number },
    q10: { type: Number },
    q11: { type: Number },
    q12: { type: String },
    q13: { type: Number },
    q14: { type: String },
    q15: { type: String },

    // Overall rating (calculated from responses)
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },

    // Feedback metadata
    submissionSource: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    },

    ipAddress: {
      type: String
    },

    userAgent: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
feedbackSchema.index({ eventId: 1, participantId: 1 }, { unique: true });
feedbackSchema.index({ eventId: 1, createdAt: -1 });
feedbackSchema.index({ overallRating: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
