const path = require("path");

const { UPLOADS_DIR } = require("../config/paths");

const WorkDetails = require("../models/workDetails");
const { TECH_STATUSES } = WorkDetails;

const uploadsPath = UPLOADS_DIR;

// Tech Department sirf share kiye gaye projects dekhta hai
const sharedFilter = { sharedToTech: true };

// @desc    List all projects shared with the Tech Department
// @route   GET /api/tech/projects
// @access  Tech, Admin
const getProjects = async (req, res, next) => {
  try {
    const projects = await WorkDetails.find(sharedFilter)
      .populate("salesUser", "name email")
      .sort({ sharedAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Tech status and notes of a project
// @route   PATCH /api/tech/projects/:id
// @access  Tech, Admin
const updateProject = async (req, res, next) => {
  try {
    const { techStatus, techNotes } = req.body;

    if (techStatus !== undefined && !TECH_STATUSES.includes(techStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status",
      });
    }

    const project = await WorkDetails.findOne({
      _id: req.params.id,
      ...sharedFilter,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (techStatus !== undefined) project.techStatus = techStatus;
    if (techNotes !== undefined) project.techNotes = String(techNotes);

    await project.save();
    await project.populate("salesUser", "name email");

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download a reference file of a shared project
// @route   GET /api/tech/projects/:id/files/:filename
// @access  Tech, Admin
const downloadReferenceFile = async (req, res, next) => {
  try {
    const project = await WorkDetails.findOne({
      _id: req.params.id,
      ...sharedFilter,
    });

    // Filename client se aata hai, isliye sirf project ki apni files allow hain
    const file = project?.referenceFiles.find(
      (item) => item.filename === req.params.filename
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const filePath = path.resolve(uploadsPath, file.filename);

    if (!filePath.startsWith(uploadsPath + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file path",
      });
    }

    return res.download(filePath, file.originalName, (error) => {
      if (error && !res.headersSent) {
        return next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  updateProject,
  downloadReferenceFile,
};
