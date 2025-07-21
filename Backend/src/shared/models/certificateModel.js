import mongoose from "mongoose";

const certificateSchema = mongoose.Schema(
  {
    // Certificate identification
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Version control for certificate templates and data
    version: {
      templateVersion: {
        type: String,
        default: "1.0.0",
        required: true,
      },
      dataVersion: {
        type: String,
        default: "1.0.0",
        required: true,
      },
      generatorVersion: {
        type: String,
        default: "1.0.0",
        required: true,
      },
    },

    // Participant and event references
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // Certificate content
    participantName: {
      type: String,
      required: true,
      trim: true,
    },
    eventTitle: {
      type: String,
      required: true,
      trim: true,
    },
    eventDuration: {
      type: String,
      required: true,
    },
    eventDates: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    venue: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      required: true,
    },

    // Certificate metadata
    issuedDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Template and design information
    template: {
      name: {
        type: String,
        default: "cream-bordered-appreciation",
        required: true,
      },
      path: {
        type: String,
        default: "template/Cream Bordered Appreciation Certificate.png",
        required: true,
      },
      dimensions: {
        width: {
          type: Number,
          default: 1200,
        },
        height: {
          type: Number,
          default: 900,
        },
      },
    },

    // Certificate validation and security
    verification: {
      qrCode: {
        type: String, // Base64 encoded QR code
      },
      verificationUrl: {
        type: String,
      },
      digitalSignature: {
        type: String, // Hash for verification
      },
      verified: {
        type: Boolean,
        default: true,
      },
    },

    // Generated certificate data
    certificateData: {
      pdfBuffer: {
        type: Buffer,
      },
      imageBuffer: {
        type: Buffer,
      },
      contentType: {
        type: String,
        default: "application/pdf",
      },
      fileName: {
        type: String,
      },
      fileSize: {
        type: Number,
      },
    },

    // Status and tracking
    status: {
      type: String,
      enum: ["draft", "generated", "issued", "revoked"],
      default: "draft",
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloaded: {
      type: Date,
    },

    // Skills and achievements (if applicable)
    skills: [{
      type: String,
      trim: true,
    }],
    achievements: [{
      type: String,
      trim: true,
    }],

    // Additional metadata
    metadata: {
      generationTime: {
        type: Number, // Time taken to generate in milliseconds
      },
      generatedOn: {
        type: String, // Server/environment info
      },
      ipAddress: {
        type: String,
      },
      userAgent: {
        type: String,
      },
    },

    // Audit trail
    auditLog: [{
      action: {
        type: String,
        enum: ["created", "generated", "downloaded", "verified", "revoked", "updated"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      details: {
        type: String,
      },
      ipAddress: {
        type: String,
      },
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for efficient queries
certificateSchema.index({ participantId: 1, eventId: 1 });
certificateSchema.index({ "verification.verificationUrl": 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ issuedDate: -1 });
certificateSchema.index({ "version.templateVersion": 1 });

// Virtual for formatted certificate ID
certificateSchema.virtual('formattedCertificateId').get(function() {
  return `CERT-${this.certificateId}`;
});

// Virtual for verification URL
certificateSchema.virtual('fullVerificationUrl').get(function() {
  return `${process.env.FRONTEND_URL}/verify-certificate/${this.certificateId}`;
});

// Pre-save middleware to generate certificate ID if not provided
certificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    this.certificateId = `${timestamp}-${random}`;
  }
  
  // Update verification URL
  if (!this.verification.verificationUrl) {
    this.verification.verificationUrl = this.fullVerificationUrl;
  }
  
  next();
});

// Instance method to add audit log entry
certificateSchema.methods.addAuditLog = function(action, performedBy, details, ipAddress) {
  this.auditLog.push({
    action,
    performedBy,
    details,
    ipAddress,
    timestamp: new Date(),
  });
  return this.save();
};

// Instance method to increment download count
certificateSchema.methods.recordDownload = function(userId, ipAddress) {
  this.downloadCount += 1;
  this.lastDownloaded = new Date();
  return this.addAuditLog('downloaded', userId, 'Certificate downloaded', ipAddress);
};

// Static method to find certificates by participant
certificateSchema.statics.findByParticipant = function(participantId) {
  return this.find({ participantId })
    .populate('eventId', 'title startDate endDate venue mode')
    .populate('participantId', 'name email')
    .sort({ issuedDate: -1 });
};

// Static method to find certificates by event
certificateSchema.statics.findByEvent = function(eventId) {
  return this.find({ eventId })
    .populate('participantId', 'name email')
    .populate('eventId', 'title startDate endDate')
    .sort({ issuedDate: -1 });
};

// Static method to verify certificate
certificateSchema.statics.verifyCertificate = function(certificateId) {
  return this.findOne({ certificateId, status: { $ne: 'revoked' } })
    .populate('participantId', 'name email')
    .populate('eventId', 'title startDate endDate venue mode')
    .populate('issuedBy', 'name email');
};

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;