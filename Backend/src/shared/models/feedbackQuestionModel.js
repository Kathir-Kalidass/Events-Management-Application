import mongoose from "mongoose";

const feedbackQuestionSchema = mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      unique: true
    },
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['rating', 'text', 'radio', 'checkbox', 'dropdown'],
      required: true
    },
    options: [{
      type: String
    }], // For radio, checkbox, dropdown types
    isRequired: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['organization', 'content', 'presentation', 'overall', 'suggestions'],
      default: 'overall'
    },
    multiline: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Number,
      default: 1
    },
    minRating: {
      type: Number,
      default: 1
    },
    maxRating: {
      type: Number,
      default: 5
    },
    placeholder: {
      type: String,
      default: ''
    },
    helpText: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
feedbackQuestionSchema.index({ isActive: 1, order: 1 });

const FeedbackQuestion = mongoose.model("FeedbackQuestion", feedbackQuestionSchema);
export default FeedbackQuestion;