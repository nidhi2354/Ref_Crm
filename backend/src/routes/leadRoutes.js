
const express = require("express");
const router = express.Router();

const { protect ,adminOnly} = require("../middlewares/auth");

const {
  getMyLeads,
  getMyFollowUps,
  getMyStats,
  getLeadHistory,
  updateMyLead,
  getAllLeads,
  getLeadAnalytics,
} = require("../controllers/leadController");

const upload = require("../middlewares/upload");
const {
  getMyWorkDetails,
  saveWorkDetails,
  shareWorkDetails,
} = require("../controllers/workDetailsController");

// Admin: view all Sales Department leads
router.get("/admin/all", protect, adminOnly, getAllLeads);

// Admin: get Sales Department analytics
router.get("/admin/analytics", protect, adminOnly, getLeadAnalytics);

// Sales user: Client Work Details
router.get("/work-details", protect, getMyWorkDetails);
router.get("/follow-ups", protect, getMyFollowUps);
router.get("/my-stats", protect, getMyStats);
router.get("/:id/history", protect, getLeadHistory);
router.put(
  "/:id/work-details",
  protect,
  upload.array("referenceFiles", 10),
  saveWorkDetails
);

router.post("/:id/work-details/share", protect, shareWorkDetails);

router.get("/", protect, getMyLeads);
router.patch("/:id", protect, updateMyLead);

module.exports = router;
