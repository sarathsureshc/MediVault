const Professional = require('../models/professional');
const User = require('../models/user');

exports.registerProfessional = async (req, res) => {
  try {
    const {
      specialization,
      registrationNumber,
      experience,
      qualifications,
      consultationFee
    } = req.body;

    // Check if professional profile already exists
    const existingProfile = await Professional.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Professional profile already exists' });
    }

    // Create professional profile
    const professional = await Professional.create({
      userId: req.user.id,
      specialization,
      registrationNumber,
      certificate: req.file.path,
      experience,
      qualifications,
      consultationFee
    });

    res.status(201).json({
      success: true,
      data: professional
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating professional profile',
      error: error.message
    });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    
    const professional = await Professional.findOneAndUpdate(
      { userId: req.user.id },
      { availability },
      { new: true, runValidators: true }
    );

    if (!professional) {
      return res.status(404).json({ message: 'Professional profile not found' });
    }

    res.json({
      success: true,
      data: professional
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating availability',
      error: error.message
    });
  }
};