const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    user = new User({
      name,
      email,
      password,
      role,
      phone,
      verificationToken
    });

    console.log('Before save - user.verificationToken:', user.verificationToken);
    await user.save();
    console.log('After save - user.verificationToken:', user.verificationToken);

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Verify your email',
      message: `Please click on this link to verify your email: ${verificationUrl}`
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Backend received token:', token);

    let user = await User.findOne({ verificationToken: token });
    console.log('User found with token:', user);

    if (!user) {
      // If no user found with this token, it might be already verified or an invalid token.
      // We can't directly check if the user is verified without their email.
      // For now, we'll return the existing error message, but this is where we'd add more logic
      // if we had a way to identify the user without the token.
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: 'Email is already verified.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token after verification
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Backend verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
