const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please add a registration number'],
    unique: true
  },
  certificate: {
    type: String,
    required: [true, 'Please upload your certificate']
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDate: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience']
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    document: String
  }],
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
      startTime: String,
      endTime: String,
      isBooked: {
        type: Boolean,
        default: false
      }
    }]
  }],
  consultationFee: {
    type: Number,
    required: [true, 'Please add consultation fee']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Professional', professionalSchema);