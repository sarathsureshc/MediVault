const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Destructure protect
const Appointment = require('../models/appointment');

// Get all appointments for a user
router.get('/', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');33333333
  }
});
3333333333333333333333333333333333333333333333333333333333333333333333
// Create new appointment
router.post('/', protect, async (req, res) => {
  try {
    const { doctorName, specialty, date, time, reason, type } = req.body;
    
    const appointment = new Appointment({
      userId: req.user.id,
      doctorName,
      specialty,
      date,
      time,
      reason,
      type,
      status: 'scheduled'
    });
    
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Update appointment
router.put('/:id', protect, async (req, res) => {
  try {
    const { doctorName, specialty, date, time, reason, type } = req.body;
    
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    // Make sure user owns appointment
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { doctorName, specialty, date, time, reason, type },
      { new: true }
    );
    
    res.json(appointment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Delete appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    // Make sure user owns appointment
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await Appointment.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Appointment removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;