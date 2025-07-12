import mongoose from "mongoose";

const claimSchema = mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    claimNumber: {
      type: String,
      unique: true,
      required: true,
    },

    expenses: [
      {
        category: {
          type: String,
          required: true,
        },
        budgetAmount: {
          type: Number,
          required: true,
        },
        actualAmount: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          default: "",
        },
        receipts: [
          {
            fileName: String,
            data: Buffer,
            contentType: String,
          }
        ],
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
      },
    ],

    totalBudgetAmount: {
      type: Number,
      required: true,
    },

    totalActualAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "under_review"],
      default: "pending",
    },

    submissionDate: {
      type: Date,
      default: Date.now,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewDate: {
      type: Date,
    },

    reviewComments: {
      type: String,
      default: "",
    },

    approvalHistory: [
      {
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        action: {
          type: String,
          enum: ["approved", "rejected", "requested_changes"],
        },
        comments: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    attachments: [
      {
        fileName: String,
        data: Buffer,
        contentType: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Financial summary
    summary: {
      totalSavings: Number, // budget - actual
      savingsPercentage: Number,
      overBudgetAmount: Number,
      overBudgetCategories: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate claim number
claimSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Claim').countDocuments();
    const year = new Date().getFullYear();
    this.claimNumber = `CLM-${year}-${String(count + 1).padStart(4, '0')}`;
    
    // Calculate summary
    this.totalBudgetAmount = this.expenses.reduce((sum, exp) => sum + exp.budgetAmount, 0);
    this.totalActualAmount = this.expenses.reduce((sum, exp) => sum + exp.actualAmount, 0);
    
    const savings = this.totalBudgetAmount - this.totalActualAmount;
    this.summary = {
      totalSavings: savings,
      savingsPercentage: this.totalBudgetAmount > 0 ? (savings / this.totalBudgetAmount) * 100 : 0,
      overBudgetAmount: savings < 0 ? Math.abs(savings) : 0,
      overBudgetCategories: this.expenses
        .filter(exp => exp.actualAmount > exp.budgetAmount)
        .map(exp => exp.category),
    };
  }
  next();
});

const Claim = mongoose.model("Claim", claimSchema);
export default Claim;