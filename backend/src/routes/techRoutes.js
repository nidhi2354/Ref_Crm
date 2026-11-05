const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middlewares/auth");
const {
  getProjects,
  updateProject,
  downloadReferenceFile,
} = require("../controllers/techController");

// Tech Department (and Admin) can see projects shared by Sales
router.use(protect, authorize("TECH", "ADMIN"));

router.get("/projects", getProjects);
router.patch("/projects/:id", updateProject);
router.get("/projects/:id/files/:filename", downloadReferenceFile);

module.exports = router;
