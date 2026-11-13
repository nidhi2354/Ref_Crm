
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
  getSalesWorkSummary,
} = require("../controllers/leadController");

const { getBatchReport } = require("../controllers/batchReportController");
const upload = require("../middlewares/upload");
const { resolveSalesScope } = require("../middlewares/salesScope");
const {
  getMyWorkDetails,
  saveWorkDetails,
  shareWorkDetails,
} = require("../controllers/workDetailsController");

// Admin: view all Sales Department leads
router.get("/admin/all", protect, adminOnly, getAllLeads);

// Admin: get Sales Department analytics
router.get("/admin/analytics", protect, adminOnly, getLeadAnalytics);

// Admin: work done by each Sales member
router.get("/admin/work-summary", protect, adminOnly, getSalesWorkSummary);

// Admin: result report of one image / file batch
router.get("/admin/batch-report", protect, adminOnly, getBatchReport);

// Sales user: Client Work Details
router.get("/work-details", protect, resolveSalesScope, getMyWorkDetails);
router.get("/follow-ups", protect, resolveSalesScope, getMyFollowUps);
router.get("/my-stats", protect, resolveSalesScope, getMyStats);
router.get("/:id/history", protect, resolveSalesScope, getLeadHistory);
router.put(
  "/:id/work-details",
  protect,
  upload.array("referenceFiles", 10),
  saveWorkDetails
);

router.post("/:id/work-details/share", protect, shareWorkDetails);

router.get("/", protect, resolveSalesScope, getMyLeads);
router.patch("/:id", protect, updateMyLead);

module.exports = router;
