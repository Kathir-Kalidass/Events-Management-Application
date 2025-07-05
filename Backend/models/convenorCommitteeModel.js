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
    enum: [
      // Patron roles
      'Chief Patron', 'Patron', 'Co-Patron',
      // Administration roles
      'Vice-Chancellor', 'Pro-Vice-Chancellor', 'Registrar', 'Controller of Examinations', 'Finance Officer',
      // Academic roles
      'Dean', 'Associate Dean', 'Head of Department', 'Associate Head of Department',
      // Organizing roles
      'Chairman', 'Vice-Chairman', 'Secretary', 'Joint Secretary', 'Treasurer', 'Convener', 'Co-Convener',
      // Coordination roles
      'Coordinator', 'Co-Coordinator', 'Technical Coordinator', 'Program Coordinator', 'Registration Coordinator',
      // Committee roles
      'Member', 'Student Member', 'External Member', 'Industry Representative', 'Guest Member', 'Honorary Member', 'Advisory Member',
      // External participant roles
      'Industry Expert', 'Government Official', 'Research Scholar', 'International Delegate', 'Distinguished Guest', 'Resource Person', 'Subject Matter Expert'
    ],
    default: 'Member'
  },
  roleCategory: {
    type: String,
    enum: ['PATRON', 'ADMINISTRATION', 'ACADEMIC', 'ORGANIZING', 'COORDINATION', 'COMMITTEE', 'EXTERNAL'],
    default: 'COMMITTEE'
  },
  isDefault: {
    type: Boolean,
    default: false,
    description: 'Whether this is a default role that appears in all events'
  },
  description: {
    type: String,
    trim: true,
    description: 'Brief description of the role responsibilities'
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
