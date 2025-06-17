import mongoose, { mongo } from "mongoose";

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    objectives: {
      type: String,
      required: true,
    },

    outcomes: {
      type: String,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "pending",
    },

    brochure: {
      data: Buffer,
      contentType: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewComments: {
      type: String,
    },

    coordinators: [
      {
        name: String,
        designation: String,
        department: String,
      },
    ],

    targetAudience: {
      type: [String],
      required: true,
    },
    resourcePersons: {
      type: [String],
      required: true,
    },

    registrationFees: [
      {
        category: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        gstPercentage: {
          type: Number,
          required: true,
        },
      },
    ],

    paymentDetails: {
      mode: {
        type: [String], // array of strings
        required: true,
      },
      payTo: {
        type: String,
        required: true,
      },
    },

    budgetBreakdown: {
      income: {
        expectedParticipants: {
          type: Number,
          required: true,
        },
        perParticipantAmount: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
      expenses: [
        {
          category: {
            type: String,
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
        },
      ],
      totalExpenditure: {
        type: Number,
        required: true,
      },
      universityOverhead: {
        type: Number,
        required: true,
      },
      gstAmount: {
        type: Number,
        required: true,
      },
    },
  },

  {
    timestamps: true,
  }
);

const event = mongoose.model("Event", eventSchema);
export default event;
