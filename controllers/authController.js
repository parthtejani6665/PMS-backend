const bcrypt = require('bcryptjs');
const db = require('../models');
const { generateToken } = require('../utils/jwt');
const { registerSchema, loginSchema } = require('../validations/authValidation');

const registerUser = async (req, res, next) => {
  try {
    // Admin only can register new users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only administrators can register new users.' });
    }

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, role, hourlyRate, isActive } = value;

    const userExists = await db.User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.User.create({
      name,
      email,
      password: hashedPassword,
      role,
      hourlyRate,
      isActive,
    });

    // Exclude password from the response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hourlyRate: user.hourlyRate,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({ message: 'User registered successfully.', user: userResponse });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account is deactivated. Please contact the administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    // Exclude password from the response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hourlyRate: user.hourlyRate,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      message: 'Logged in successfully.',
      user: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe };
