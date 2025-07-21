import mongoose from "mongoose";

const participantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    institution: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      enum: ['UG Student', 'PG Student', 'Research Scholar', 'Assistant Professor', 'Associate Professor', 'Professor', 'Industry Professional', 'Other'],
      default: 'UG Student',
    },
    // Event-specific registration details
    eventRegistrations: [{
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
      },
      registrationDate: {
        type: Date,
        default: Date.now,
      },
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
      attended: {
        type: Boolean,
        default: false,
      },
      feedbackGiven: {
        type: Boolean,
        default: false,
      },
      certificateGenerated: {
        type: Boolean,
        default: false,
      },
    }],
    // Creator (coordinator who added this participant)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Password is DOB in DDMMYYYY format
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
participantSchema.index({ 'eventRegistrations.eventId': 1 });
participantSchema.index({ createdBy: 1 });

const Participant = mongoose.model("Participant", participantSchema);
export default Participant;
