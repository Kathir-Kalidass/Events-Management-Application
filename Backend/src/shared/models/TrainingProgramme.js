// models/TrainingProgramme.js
import mongoose from "mongoose";

const trainingProgrammeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, required: true },
    mode: {
      type: String,
      required: true,
      enum: ["Online", "Offline", "Hybrid"],
    },
    duration: { type: String, required: true },
    type: { type: String, required: true },
    objectives: { type: String, required: true },
    outcomes: { type: String, required: true },
    budget: { type: Number, required: true },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },

    coordinators: [
      {
        name: String,
        designation: String,
        department: String,
      },
    ],

    targetAudience: [String],
    resourcePersons: [String],

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
          gstPercentage: Number,
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
          // Individual item approval status
          itemStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
          },
          approvedAmount: {
            type: Number,
            default: 0,
          },
          rejectionReason: {
            type: String,
            default: "",
          },
          reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          reviewDate: {
            type: Date,
          },
          receiptGenerated: {
            type: Boolean,
            default: false,
          },
          receiptNumber: {
            type: String,
          },
          receiptData: {
            data: Buffer,
            contentType: String,
            fileName: String,
          },
        },
      ],
      totalExpenditure: Number,
      totalApprovedAmount: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
    },
    claimPDF: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    claimSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TrainingProgramme = mongoose.model(
  "TrainingProgramme",
  trainingProgrammeSchema
);
export default TrainingProgramme;