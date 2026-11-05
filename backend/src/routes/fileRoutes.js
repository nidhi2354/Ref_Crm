
const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const { protect, adminOnly } = require("../middlewares/auth");
const {
  uploadFileToSales,
   getMyFiles,
   downloadMyFile,
   getAllAssignedFiles,
} = require("../controllers/fileController");




// Admin uploads a file for a Sales user
router.post(
  "/upload",
  protect,
  adminOnly,
  upload.single("file"),
  uploadFileToSales
);

// Admin: view all assigned files
router.get("/", protect, adminOnly, getAllAssignedFiles);


// Sales user can view their own files
router.get("/my-files", protect, getMyFiles);

// Sales user can download their own file
router.get("/my-files/:id/download", protect, downloadMyFile);


module.exports = router;
