const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const { name, email, password, type } = req.body;
    if (await User.findOne({ where: { email } }))
      return res.status(400).json({ message: 'Email already in use.' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hash, 
      type: type || 'student' 
    });
    
    // Don't send password in response
    const userResponse = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      type: user.type
    };
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.userId, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Prepare user data without sensitive info
    const userData = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      type: user.type
    };
    
    // Send user data along with token
    res.json({ 
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed.' });
  }
};

exports.getProfile = async (req, res) => {
  // req.user populated by authMiddleware
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, email } = req.body;
    await user.update({ name, email });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile update failed.' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await req.user.destroy();
    res.json({ message: 'Profile deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile deletion failed.' });
  }
};
