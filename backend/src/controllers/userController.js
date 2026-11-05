
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Roles an Admin can create and manage
const MANAGED_ROLES = ["SALES", "TECH"];

// Create User
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Admin can create only Sales or Tech users (default: Sales)
    const userRole = role === undefined ? "SALES" : role;

    if (!MANAGED_ROLES.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be SALES or TECH",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create new user
   const user = await User.create({
  name,
  email,
  password,
  role: userRole,
});

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login User


const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    // Send response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


//// Get Logged-in User Profile
const getMe = async (req, res, next) => {

  
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Get All Users - Admin
const getAllUsers = async (req, res, next) => {
  try {
    const role = MANAGED_ROLES.includes(req.query.role)
      ? req.query.role
      : "SALES";

    const users = await User.find({ role })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};





// Get Single Sales User - Admin Only
const getSalesUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: MANAGED_ROLES },
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Sales user not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


// Update Sales User Status - Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: { $in: MANAGED_ROLES },
      },
      {
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Sales user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Sales user ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


const updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Check if at least one field is provided
    if (name === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide name or email to update",
      });
    }

    // Find the Sales user
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: MANAGED_ROLES },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Sales user not found",
      });
    }

    // Update name
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    // Update email
    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }

      user.email = normalizedEmail;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Sales user updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createUser,
  loginUser,
  getMe,
  getAllUsers,
  getSalesUserById,
  updateUserStatus,
  updateUser,
};

