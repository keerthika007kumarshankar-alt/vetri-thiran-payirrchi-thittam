const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { generateTokens } = require("../utils/tokens");

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    // User.js pre-save hook will hash the password
    const user = await User.create({
      name,
      email,
      password: password,
      role: role || "student",
    });

    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.role
    );

    res.status(201).json({
      message: "Registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.role
    );

    res.json({
      message: "Logged in",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const tokens = generateTokens(
      decoded.userId,
      decoded.role
    );

    res.json(tokens);
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.json({
    message: "Logged out successfully",
  });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};