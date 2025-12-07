const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !password || !phone) {
    res.status(400);
    throw new Error("Please add all required fields");
  }

  // Check if user exists (by email OR phone)
  const query = [{ phone: phone }];
  if (email) query.push({ email: email.toLowerCase() });

  const userExists = await User.findOne({ $or: query });

  if (userExists) {
    res.status(400);
    throw new Error("User with this phone or email already exists");
  }

  // Create user (password hashing is handled in model pre-save hook)
  // Users who register via join form are set to pending status
  const user = await User.create({
    name,
    email: email ? email.toLowerCase() : undefined,
    password,
    phone,
    role: "user", // Default role
    membershipStatus: "pending", // New registrations need admin approval
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res.status(400);
    throw new Error("Please add mobile number and password");
  }

  // Check for user by phone
  const user = await User.findOne({ phone });

  // Check password
  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(403);
      throw new Error("Account is inactive. Please contact admin.");
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401);
    throw new Error("Invalid mobile number or password");
  }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    joinDate: user.createdAt,
    profileImage: user.profileImage,
    address: user.address,
    occupation: user.occupation,
    bio: user.bio,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  user.profileImage = req.body.profileImage || user.profileImage;
  user.address = req.body.address || user.address;
  user.occupation = req.body.occupation || user.occupation;
  user.bio = req.body.bio || user.bio;

  if (req.body.email) {
    user.email = req.body.email.toLowerCase();
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    role: updatedUser.role,
    profileImage: updatedUser.profileImage,
    address: updatedUser.address,
    occupation: updatedUser.occupation,
    bio: updatedUser.bio,
    token: generateToken(updatedUser._id, updatedUser.role),
  });
});

// @desc    Create new user (Admin only)
// @route   POST /api/auth/users
// @access  Private (Admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, customRole } = req.body;

  if (!name || !password || !phone) {
    res.status(400);
    throw new Error("Please add all required fields: name, password, and mobile number");
  }

  // Check if user exists (by email OR phone)
  const query = [{ phone: phone }];
  if (email) query.push({ email: email.toLowerCase() });

  const userExists = await User.findOne({ $or: query });

  if (userExists) {
    res.status(400);
    throw new Error("User with this phone or email already exists");
  }

  // Determine role - if role is 'other', use customRole, otherwise use the role provided
  let finalRole = role || 'user';
  let finalCustomRole = '';
  
  if (role === 'other') {
    if (!customRole || customRole.trim() === '') {
      res.status(400);
      throw new Error("Please specify the custom role");
    }
    finalRole = 'user'; // Default role for custom roles
    finalCustomRole = customRole.trim();
  } else {
    // Validate role is one of the allowed values
    if (!['user', 'admin', 'advisor'].includes(finalRole)) {
      res.status(400);
      throw new Error("Invalid role. Allowed roles: user, admin, advisor, or other");
    }
  }

  // Create user (password hashing is handled in model pre-save hook)
  const user = await User.create({
    name,
    email: email ? email.toLowerCase() : undefined,
    password,
    phone,
    role: finalRole,
    customRole: finalCustomRole,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      customRole: user.customRole,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ name: 1 });
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.json({ message: "User removed" });
});

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private (Admin)
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = req.body.role || user.role;
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    role: updatedUser.role,
  });
});

// Generate JWT
const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || "sdhkjdhkadhudjbsxzkxkshnxasa";
  if (!process.env.JWT_SECRET) {
    console.warn(
      "WARNING: JWT_SECRET not set. Using default secret. Please create a .env file with JWT_SECRET!"
    );
  }
  return jwt.sign({ id, role }, secret, {
    expiresIn: "7d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  createUser,
  getAllUsers,
  deleteUser,
  updateUserRole,
};
