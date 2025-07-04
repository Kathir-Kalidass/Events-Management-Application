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

// New model to match frontend feedback form
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

    email: { type: String, required: true },

    name: { type: String, required: true },

    designation: { type: String, required: true },

    institute: { type: String, required: true },

    contact: { type: String, required: true },

    q7: { type: Number, required: true },

    q8: { type: Number, required: true },

    q9: { type: Number, required: true },

    q10: { type: Number, required: true },

    q11: { type: Number, required: true },

    q12: { type: String, required: true },

    q13: { type: Number, required: true },

    q14: { type: String, required: true }, // Yes/No

    q15: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
