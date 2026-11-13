const mongoose = require("mongoose");
const User = require("../models/User");

// Read-only data ke liye: kiska data dikhana hai.
// - Sales user: hamesha apna data (?salesUserId ignore nahi, 403 deta hai)
// - Admin: ?salesUserId=<id> diya ho to us Sales user ka data, warna khaali
// Sirf GET routes par lagta hai. Write routes hamesha logged-in user ke liye hi rahte hain.
const resolveSalesScope = async (req, res, next) => {
  try {
    const requestedId = req.query.salesUserId;

    if (!requestedId) {
      req.scopeUserId = req.user._id;
      req.isAdminView = false;
      return next();
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!mongoose.isValidObjectId(requestedId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid salesUserId",
      });
    }

    const target = await User.findOne({
      _id: requestedId,
      role: "SALES",
    }).select("_id");

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Sales user not found",
      });
    }

    req.scopeUserId = target._id;
    req.isAdminView = true;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { resolveSalesScope };
