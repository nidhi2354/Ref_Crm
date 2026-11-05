const mongoose = require("mongoose");

const WORK_TYPES = ["SEO", "SMO", "GMB", "WEBSITE", "OTHER"];
const TECH_STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"];

const referenceFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const workDetailsSchema = new mongoose.Schema(
  {
    // Ek lead ki ek hi Client Work Details form hoti hai
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      unique: true,
    },

    salesUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    clientName: { type: String, required: true, trim: true },
    companyName: { type: String, default: "", trim: true },
    phoneNo: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },

    workType: { type: String, enum: WORK_TYPES, required: true },
    projectTitle: { type: String, required: true, trim: true },
    projectDescription: { type: String, default: "", trim: true },

    budget: { type: Number, default: null, min: 0 },
    paymentDetails: { type: String, default: "", trim: true },
    deadline: { type: Date, default: null },
    additionalNotes: { type: String, default: "", trim: true },

    referenceFiles: { type: [referenceFileSchema], default: [] },

    // Tech Department ban jaane par share flow yahin se jud jayega
    sharedToTech: { type: Boolean, default: false },
    sharedAt: { type: Date, default: null },

    // Tech Department ka kaam
    techStatus: {
      type: String,
      enum: TECH_STATUSES,
      default: "PENDING",
    },
    techNotes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkDetails", workDetailsSchema);
module.exports.WORK_TYPES = WORK_TYPES;
module.exports.TECH_STATUSES = TECH_STATUSES;
