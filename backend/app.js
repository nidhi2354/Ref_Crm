
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Behind a proxy (Render etc.) so client IPs and HTTPS are read correctly
app.set("trust proxy", 1);

// Allowed frontend origins, comma separated: CLIENT_URL=https://crm.example.com
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Routes
const userRoutes = require("./src/routes/userRoutes");
const fileRoutes = require("./src/routes/fileRoutes");
const leadRoutes = require("./src/routes/leadRoutes");
const techRoutes = require("./src/routes/techRoutes");
const { notFound, errorHandler } = require("./src/middlewares/errorHandler");


// Slow down password guessing: only failed logins are counted
app.use(
  "/api/users/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many failed login attempts. Please try again in 15 minutes.",
    },
  })
);

app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tech", techRoutes);


// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM API is running",
  });
});

// Must stay after all routes
app.use(notFound);
app.use(errorHandler);

module.exports = app;
