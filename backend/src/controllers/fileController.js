const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const { UPLOADS_DIR } = require("../config/paths");

const User = require("../models/User");
const File = require("../models/file");
const Lead = require("../models/lead");

// ========================================
// 1. UPLOAD FILE AND IMPORT EXCEL/CSV LEADS
// ========================================

const uploadFileToSales = async (req, res, next) => {
  let savedFile = null;

  try {
    const { salesUserId } = req.body;

    if (!salesUserId) {
      return res.status(400).json({
        success: false,
        message: "Please select a Sales user",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload",
      });
    }

    // Find the selected Sales User
    const salesUser = await User.findOne({
      _id: salesUserId,
      role: "SALES",
    });

    if (!salesUser) {
      fs.unlink(req.file.path, () => {});

      return res.status(404).json({
        success: false,
        message: "Sales user not found",
      });
    }

    // Check whether the uploaded file is Excel or CSV
    const extension = path
      .extname(req.file.originalname)
      .toLowerCase();

    const isSpreadsheet = [".xlsx", ".xls", ".csv"].includes(
      extension
    );

    let leadRecords = [];

    // ========================================
    // READ EXCEL/CSV DATA
    // ========================================

    if (isSpreadsheet) {
      const workbook = XLSX.readFile(req.file.path);

      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        fs.unlink(req.file.path, () => {});

        return res.status(400).json({
          success: false,
          message: "The uploaded spreadsheet has no worksheet",
        });
      }

      const worksheet = workbook.Sheets[firstSheetName];

      // Convert spreadsheet rows into JavaScript objects
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
      });

      // Ignore completely empty rows
      leadRecords = rows.filter((row) =>
        Object.values(row).some(
          (value) => String(value).trim() !== ""
        )
      );

      if (leadRecords.length === 0) {
        fs.unlink(req.file.path, () => {});

        return res.status(400).json({
          success: false,
          message:
            "No lead records found. Please check your Excel/CSV file.",
        });
      }
    }

    // ========================================
    // SAVE UPLOADED FILE IN MONGODB
    // ========================================

    savedFile = await File.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      salesUser: salesUser._id,
      uploadedBy: req.user._id,
    });

    // ========================================
    // SAVE SPREADSHEET ROWS AS LEADS
    // ========================================

    let importedCount = 0;

    if (isSpreadsheet) {
      const leadsToInsert = leadRecords.map((record) => ({
        data: record,
        salesUser: salesUser._id,
        sourceFile: savedFile._id,
        status: "NEW",
        followUpDate: null,
        notes: "",
      }));

      const importedLeads = await Lead.insertMany(leadsToInsert);

      importedCount = importedLeads.length;
    }

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,
      message: isSpreadsheet
        ? "File uploaded and leads imported successfully"
        : "File uploaded and assigned successfully",
      data: {
        file: {
          _id: savedFile._id,
          originalName: savedFile.originalName,
          filename: savedFile.filename,
          mimeType: savedFile.mimeType,
          size: savedFile.size,
          salesUser: savedFile.salesUser,
          uploadedBy: savedFile.uploadedBy,
          createdAt: savedFile.createdAt,
        },
        leadsImported: importedCount,
      },
    });
  } catch (error) {
    // Roll back the file record if the operation fails
    if (savedFile) {
      await File.deleteOne({ _id: savedFile._id }).catch(
        () => {}
      );
    }

    // Remove the uploaded file if the operation fails
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    next(error);
  }
};

// ========================================
// 2. GET FILES ASSIGNED TO LOGGED-IN SALES USER
// ========================================

const getMyFiles = async (req, res, next) => {
  try {
    const files = await File.find({
      salesUser: req.user._id,
    })
      .select("-filePath")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// 3. DOWNLOAD ASSIGNED FILE
// ========================================

const downloadMyFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      salesUser: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Stored filename + current uploads folder (works after moving servers)
    const uploadsPath = UPLOADS_DIR;
    const filePath = path.resolve(uploadsPath, file.filename);

    // Ensure the file is inside the uploads folder
    if (!filePath.startsWith(uploadsPath + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file path",
      });
    }

    return res.download(
      filePath,
      file.originalName,
      (error) => {
        if (error && !res.headersSent) {
          return next(error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
};




const getAllAssignedFiles = async (req, res, next) => {
  try {
    const files = await File.find()
      .populate("salesUser", "name email")
      .populate("uploadedBy", "name email")
      .select("-filePath")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};
// ========================================
// EXPORT CONTROLLER FUNCTIONS
// ========================================

module.exports = {
  uploadFileToSales,
  getMyFiles,
  downloadMyFile,
  getAllAssignedFiles,
};