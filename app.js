require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const companyRoutes = require("./Routes/company.routes");
const roleRoutes = require("./Routes/role.routes");
const userRoutes = require("./Routes/user.routes");
const departmentRoutes = require("./Routes/department.routes");
const designationRoutes = require("./Routes/designation.routes");
const attendanceRoutes = require("./Routes/attendance.routes");
const cronJobs = require("./utils/cron");
const AttendanceModel = require("./models/attendance.model");

const app = express();

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { success: false, message: "Too many requests from this IP", data: {} }
});
app.use("/api/", apiLimiter);
app.use(helmet()); // security headers
app.use(morgan("dev")); // API logging

// Routes
app.use("/api/companies", companyRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/attendance", attendanceRoutes);

// Serve static React build files
app.use(express.static(path.join(__dirname, "react-crud-ui/dist")));

// Any non-API route gets served the frontend index.html
app.get(/.*/, (req, res) => {
  if (req.url.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "react-crud-ui/dist/index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

// Initialize DB layout and Cron
AttendanceModel.initTable();
cronJobs.initCronJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
