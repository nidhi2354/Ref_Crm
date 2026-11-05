
const Lead = require("../models/lead");
const File = require("../models/file");

// @desc    Get leads assigned to logged-in Sales User
// @route   GET /api/leads
// @access  Private
const getMyLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find({
      salesUser: req.user._id,
    })
      .select("-history")
      .populate("sourceFile", "originalName")
      .sort({ createdAt: -1 });

    const formattedLeads = leads.map((lead) => ({
      _id: lead._id,
      ...lead.data.toObject?.() || lead.data,
      status: lead.status,
      followUpDate: lead.followUpDate,
      notes: lead.notes,
      sourceFile: lead.sourceFile,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedLeads.length,
      data: formattedLeads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status, follow-up date and notes
// @route   PATCH /api/leads/:id
// @access  Private
const updateMyLead = async (req, res, next) => {
  try {
    const { status, followUpDate, notes, note } = req.body;

    const allowedStatuses = [
      "NEW",
      "FOLLOW_UP",
      "PROSPECTIVE",
      "CONVERTED",
      "NOT_INTERESTED",
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead status",
      });
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      salesUser: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const toDay = (date) => (date ? date.toISOString().slice(0, 10) : null);
    const historyEntry = {};

    if (status !== undefined && status !== lead.status) {
      historyEntry.fromStatus = lead.status;
      historyEntry.toStatus = status;
      lead.status = status;
    }

    if (followUpDate !== undefined) {
      let newDate = null;

      if (followUpDate !== "" && followUpDate !== null) {
        newDate = new Date(followUpDate);

        if (Number.isNaN(newDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid follow-up date",
          });
        }
      }

      if (toDay(newDate) !== toDay(lead.followUpDate)) {
        historyEntry.followUpChanged = true;
        historyEntry.followUpDate = newDate;
        lead.followUpDate = newDate;
      }
    }

    // "note" ek follow-up note hai jo history mein judta hai
    const newNote = typeof note === "string" ? note.trim() : "";

    if (newNote) {
      historyEntry.note = newNote;
      lead.notes = newNote;
    } else if (notes !== undefined) {
      lead.notes = notes;
    }

    if (Object.keys(historyEntry).length > 0) {
      lead.history.push(historyEntry);
    }

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};



// @desc    Dashboard numbers of the logged-in Sales User
// @route   GET /api/leads/my-stats?today=YYYY-MM-DD
// @access  Private
const getMyStats = async (req, res, next) => {
  try {
    // Client apni local date bhejta hai taaki overdue/today sahi aaye
    const todayText = /^\d{4}-\d{2}-\d{2}$/.test(req.query.today || "")
      ? req.query.today
      : new Date().toISOString().slice(0, 10);

    const startOfToday = new Date(todayText);
    const startOfTomorrow = new Date(startOfToday.getTime() + 86400000);

    const mine = { salesUser: req.user._id };
    const open = { status: { $nin: ["CONVERTED", "NOT_INTERESTED"] } };

    const [byStatus, overdue, dueToday, upcoming, assignedFiles] =
      await Promise.all([
        Lead.aggregate([
          { $match: mine },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Lead.countDocuments({
          ...mine,
          ...open,
          followUpDate: { $ne: null, $lt: startOfToday },
        }),
        Lead.countDocuments({
          ...mine,
          ...open,
          followUpDate: { $gte: startOfToday, $lt: startOfTomorrow },
        }),
        Lead.countDocuments({
          ...mine,
          ...open,
          followUpDate: { $gte: startOfTomorrow },
        }),
        File.countDocuments({ salesUser: req.user._id }),
      ]);

    const statusCounts = {
      NEW: 0,
      FOLLOW_UP: 0,
      PROSPECTIVE: 0,
      CONVERTED: 0,
      NOT_INTERESTED: 0,
    };

    byStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    const totalLeads = Object.values(statusCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        statusCounts,
        convertedClients: statusCounts.CONVERTED,
        followUps: { overdue, dueToday, upcoming },
        assignedFiles,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leads with a follow-up date, due date wise
// @route   GET /api/leads/follow-ups
// @access  Private
const getMyFollowUps = async (req, res, next) => {
  try {
    const leads = await Lead.find({
      salesUser: req.user._id,
      followUpDate: { $ne: null },
      status: { $nin: ["CONVERTED", "NOT_INTERESTED"] },
    })
      .select("-history")
      .sort({ followUpDate: 1 });

    const data = leads.map((lead) => ({
      _id: lead._id,
      ...(lead.data?.toObject?.() || lead.data || {}),
      status: lead.status,
      followUpDate: lead.followUpDate,
      notes: lead.notes,
      updatedAt: lead.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activity history of one lead
// @route   GET /api/leads/:id/history
// @access  Private
const getLeadHistory = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      salesUser: req.user._id,
    }).select("history");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      data: [...lead.history].reverse(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leads across the Sales Department
// @route   GET /api/leads/admin/all
// @access  Admin only
const getAllLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find()
      .select("-history")
      .populate("salesUser", "name email role")
      .populate("sourceFile", "originalName")
      .sort({ createdAt: -1 });

    const formattedLeads = leads.map((lead) => ({
      _id: lead._id,
      ...(lead.data?.toObject?.() || lead.data || {}),
      status: lead.status,
      followUpDate: lead.followUpDate,
      notes: lead.notes,
      salesUser: lead.salesUser,
      sourceFile: lead.sourceFile,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedLeads.length,
      data: formattedLeads,
    });
  } catch (error) {
    next(error);
  }
};




// GET /api/leads/admin/analytics
const getLeadAnalytics = async (req, res, next) => {
  try {
    const User = require("../models/User");

    const [
      totalLeads,
      newLeads,
      followUps,
      prospectiveLeads,
      convertedClients,
      notInterested,
      totalSalesUsers,
      activeSalesUsers,
      salesPerformance,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "NEW" }),
      Lead.countDocuments({ status: "FOLLOW_UP" }),
      Lead.countDocuments({ status: "PROSPECTIVE" }),
      Lead.countDocuments({ status: "CONVERTED" }),
      Lead.countDocuments({ status: "NOT_INTERESTED" }),

      User.countDocuments({ role: "SALES" }),
      User.countDocuments({ role: "SALES", isActive: true }),

      Lead.aggregate([
        {
          $group: {
            _id: "$salesUser",
            totalLeads: { $sum: 1 },
            converted: {
              $sum: {
                $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0],
              },
            },
            followUps: {
              $sum: {
                $cond: [{ $eq: ["$status", "FOLLOW_UP"] }, 1, 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "salesUser",
          },
        },
        { $unwind: "$salesUser" },
        {
          $project: {
            _id: 0,
            salesUserId: "$salesUser._id",
            name: "$salesUser.name",
            email: "$salesUser.email",
            totalLeads: 1,
            converted: 1,
            followUps: 1,
          },
        },
        { $sort: { totalLeads: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        followUps,
        prospectiveLeads,
        convertedClients,
        notInterested,
        totalSalesUsers,
        activeSalesUsers,
        salesPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyLeads,
  getMyFollowUps,
  getMyStats,
  getLeadHistory,
  updateMyLead,
  getAllLeads,
  getLeadAnalytics,
};
