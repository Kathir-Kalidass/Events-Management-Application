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
      enum: ["Online", "Offline", "Hybrid"],
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
      enum: ["pending", "approved", "rejected"],
    },

    brochure: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },

    claimBill: {
      expenses: [
        {
          category: String,
          amount: Number,
        },
      ],
      totalExpenditure: Number,
    },

    claimPDF: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },

    claimSubmitted: { type: Boolean, default: false },

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

    // Organizing departments
    organizingDepartments: {
      primary: {
        type: String,
        default: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
      },
      associative: {
        type: [String], // Array of additional departments like "CENTRE FOR CYBER SECURITY (CCS)"
        default: [],
      }
    },

    // HOD approvers for different departments
    departmentApprovers: [
      {
        department: String, // e.g., "DCSE", "CCS", etc.
        hodName: String,
        hodDesignation: String,
        approved: {
          type: Boolean,
          default: false,
        },
        approvedDate: Date,
        signature: String, // Path to signature image or base64
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

    approvers: [
      {
        name: String,
        role: String,
      },
    ],

    budgetBreakdown: {
      income: [
        {
          category: String,
          expectedParticipants: Number,
          perParticipantAmount: Number,
          gstPercentage: { type: Number, default: 0 },
          income: Number, // auto-calculated value from frontend
        },
      ],
      expenses: [
        {
          category: String,
          amount: Number,
        },
      ],
      totalIncome: Number, // sum of all income[].income
      totalExpenditure: Number, // sum of all expenses[].amount
      universityOverhead: Number, // 30% of totalIncome
    },

  },

  {
    timestamps: true,
  }
);

const event = mongoose.model("Event", eventSchema);
export default event;
