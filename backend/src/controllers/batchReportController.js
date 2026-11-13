const mongoose = require("mongoose");
const XLSX = require("xlsx");

const File = require("../models/file");
const Lead = require("../models/lead");

const STATUS_LABELS = {
  NEW: "New",
  FOLLOW_UP: "Follow-up",
  PROSPECTIVE: "Prospective",
  CONVERTED: "Converted",
  NOT_INTERESTED: "Not Interested",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN") : "";

// Ek image batch ke har lead ka current result, ek standard format mein
// @route   GET /api/leads/admin/batch-report?sourceFile=<fileId>&format=xlsx (optional)
// @access  Admin only
const getBatchReport = async (req, res, next) => {
  try {
    const { sourceFile, format } = req.query;

    if (!sourceFile || !mongoose.isValidObjectId(sourceFile)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid image batch",
      });
    }

    const file = await File.findById(sourceFile)
      .select("originalName createdAt salesUser")
      .populate("salesUser", "name");

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const leads = await Lead.find({ sourceFile })
      .select("data status followUpDate notes history salesUser")
      .populate("salesUser", "name")
      .lean();

    const rows = leads.map((lead) => {
      const history = lead.history || [];
      const lastNoteEntry = [...history].reverse().find((item) => item.note);
      const lastEntry = history[history.length - 1];

      return {
        name: lead.data?.Name || "",
        phone: lead.data?.Phone || "",
        email: lead.data?.Email || "",
        company: lead.data?.Company || "",
        city: lead.data?.City || "",
        requirement: lead.data?.Requirement || "",
        salesUser: lead.salesUser?.name || "",
        status: lead.status,
        followUpDate: lead.followUpDate || null,
        lastNote: lastNoteEntry?.note || lead.notes || "",
        activities: history.length,
        lastActivity: lastEntry?.at || null,
      };
    });

    const countStatus = (status) =>
      rows.filter((row) => row.status === status).length;

    const summary = {
      total: rows.length,
      newLeads: countStatus("NEW"),
      followUp: countStatus("FOLLOW_UP"),
      prospective: countStatus("PROSPECTIVE"),
      converted: countStatus("CONVERTED"),
      notInterested: countStatus("NOT_INTERESTED"),
      untouched: rows.filter((row) => row.activities === 0).length,
    };

    if (format === "xlsx") {
      const leadSheet = XLSX.utils.json_to_sheet(
        rows.map((row) => ({
          Name: row.name,
          Phone: row.phone,
          Email: row.email,
          Company: row.company,
          City: row.city,
          Requirement: row.requirement,
          "Sales Member": row.salesUser,
          Status: STATUS_LABELS[row.status] || row.status,
          "Follow-up Date": formatDate(row.followUpDate),
          "Last Note": row.lastNote,
          "Activities": row.activities,
          "Last Activity": formatDateTime(row.lastActivity),
        }))
      );

      const summarySheet = XLSX.utils.json_to_sheet([
        { Metric: "Total leads", Value: summary.total },
        { Metric: "New", Value: summary.newLeads },
        { Metric: "Follow-up", Value: summary.followUp },
        { Metric: "Prospective", Value: summary.prospective },
        { Metric: "Converted", Value: summary.converted },
        { Metric: "Not Interested", Value: summary.notInterested },
        { Metric: "Untouched (no activity)", Value: summary.untouched },
      ]);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
      XLSX.utils.book_append_sheet(workbook, leadSheet, "Leads");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      const safeName = (file.originalName || "batch").replace(/[^\w.-]+/g, "_");

      res.set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="report-${safeName}.xlsx"`,
      });

      return res.send(buffer);
    }

    return res.status(200).json({
      success: true,
      data: {
        batch: {
          _id: file._id,
          originalName: file.originalName,
          createdAt: file.createdAt,
          salesUser: file.salesUser?.name || "",
        },
        summary,
        rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBatchReport };
