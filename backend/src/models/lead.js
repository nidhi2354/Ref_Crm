const mongoose = require("mongoose");

const STATUSES = [
  "NEW",
  "FOLLOW_UP",
  "PROSPECTIVE",
  "CONVERTED",
  "NOT_INTERESTED",
];

// Ek update = ek entry (status change, naya follow-up date, ya note)
const historySchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    fromStatus: { type: String, enum: STATUSES, default: undefined },
    toStatus: { type: String, enum: STATUSES, default: undefined },
    followUpChanged: { type: Boolean, default: false },
    followUpDate: { type: Date, default: null },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    // Excel/CSV se aane wala original record
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Lead kis Sales User ko assign hui hai
    salesUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Admin ki uploaded file ka reference
    sourceFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },

    // Sales User lead ka status update karega
    status: {
      type: String,
      enum: [
        "NEW",
        "FOLLOW_UP",
        "PROSPECTIVE",
        "CONVERTED",
        "NOT_INTERESTED",
      ],
      default: "NEW",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    // Status change, follow-up date aur notes ki history
    history: {
      type: [historySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);