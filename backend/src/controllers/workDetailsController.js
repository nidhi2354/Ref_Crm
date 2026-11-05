const fs = require("fs");
const path = require("path");

const { UPLOADS_DIR } = require("../config/paths");

const Lead = require("../models/lead");
const WorkDetails = require("../models/workDetails");
const { WORK_TYPES } = WorkDetails;

const uploadsPath = UPLOADS_DIR;

const removeUploaded = (files = []) => {
  files.forEach((file) => fs.unlink(file.path, () => {}));
};

const removeStored = (files = []) => {
  files.forEach((file) =>
    fs.unlink(path.join(uploadsPath, file.filename), () => {})
  );
};

// @desc    Get Client Work Details of all leads of the logged-in Sales User
// @route   GET /api/leads/work-details
// @access  Private
const getMyWorkDetails = async (req, res, next) => {
  try {
    const details = await WorkDetails.find({ salesUser: req.user._id });

    res.status(200).json({
      success: true,
      count: details.length,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update Client Work Details of a lead
// @route   PUT /api/leads/:id/work-details
// @access  Private
const saveWorkDetails = async (req, res, next) => {
  const newFiles = req.files || [];

  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      salesUser: req.user._id,
    });

    if (!lead) {
      removeUploaded(newFiles);
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const body = req.body;
    const clientName = (body.clientName || "").trim();
    const projectTitle = (body.projectTitle || "").trim();

    if (!clientName) {
      removeUploaded(newFiles);
      return res.status(400).json({
        success: false,
        message: "Client Name is required",
      });
    }

    if (!WORK_TYPES.includes(body.workType)) {
      removeUploaded(newFiles);
      return res.status(400).json({
        success: false,
        message: "Please select a valid Work Type",
      });
    }

    if (!projectTitle) {
      removeUploaded(newFiles);
      return res.status(400).json({
        success: false,
        message: "Project Title is required",
      });
    }

    let budget = null;
    if (body.budget !== undefined && body.budget !== "") {
      budget = Number(body.budget);

      if (!Number.isFinite(budget) || budget < 0) {
        removeUploaded(newFiles);
        return res.status(400).json({
          success: false,
          message: "Budget must be a positive number",
        });
      }
    }

    let deadline = null;
    if (body.deadline) {
      deadline = new Date(body.deadline);

      if (Number.isNaN(deadline.getTime())) {
        removeUploaded(newFiles);
        return res.status(400).json({
          success: false,
          message: "Invalid deadline",
        });
      }
    }

    const existing = await WorkDetails.findOne({ lead: lead._id });
    const previousFiles = existing ? existing.referenceFiles : [];

    // Frontend un purani files ke naam bhejta hai jinko rakhna hai
    let keepNames = [];
    try {
      keepNames = JSON.parse(body.keepFiles || "[]");
    } catch {
      keepNames = [];
    }

    const keptFiles = previousFiles.filter((file) =>
      keepNames.includes(file.filename)
    );
    const droppedFiles = previousFiles.filter(
      (file) => !keepNames.includes(file.filename)
    );

    const addedFiles = newFiles.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    }));

    const values = {
      lead: lead._id,
      salesUser: req.user._id,
      clientName,
      companyName: body.companyName,
      phoneNo: body.phoneNo,
      email: body.email,
      workType: body.workType,
      projectTitle,
      projectDescription: body.projectDescription,
      budget,
      paymentDetails: body.paymentDetails,
      deadline,
      additionalNotes: body.additionalNotes,
      referenceFiles: [...keptFiles, ...addedFiles],
    };

    const saved = await WorkDetails.findOneAndUpdate(
      { lead: lead._id },
      values,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    removeStored(droppedFiles);

    res.status(200).json({
      success: true,
      message: "Client work details saved successfully",
      data: saved,
    });
  } catch (error) {
    removeUploaded(newFiles);
    next(error);
  }
};

// @desc    Share saved Client Work Details with the Tech Department
// @route   POST /api/leads/:id/work-details/share
// @access  Private
const shareWorkDetails = async (req, res, next) => {
  try {
    const details = await WorkDetails.findOneAndUpdate(
      { lead: req.params.id, salesUser: req.user._id },
      { sharedToTech: true, sharedAt: new Date() },
      { new: true }
    );

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "Please save the client work details before sharing.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shared with the Tech Department",
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyWorkDetails,
  saveWorkDetails,
  shareWorkDetails,
};
