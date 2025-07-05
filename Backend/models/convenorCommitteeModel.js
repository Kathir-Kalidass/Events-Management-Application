import mongoose from "mongoose";

const convenorCommitteeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: false,
    trim: true
  },
  role: {
    type: String,
    enum: ['Member', 'Chairman', 'Secretary', 'Vice-Chairman', 'Treasurer'],
    default: 'Member'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Make it optional for now until auth is working
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
convenorCommitteeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ConvenorCommittee = mongoose.model("ConvenorCommittee", convenorCommitteeSchema);

export default ConvenorCommittee;
