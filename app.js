require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const companyRoutes = require("./Routes/company.routes");
const roleRoutes = require("./Routes/role.routes");
const userRoutes = require("./Routes/user.routes");
const departmentRoutes = require("./Routes/department.routes");
const designationRoutes = require("./Routes/designation.routes");

const app = express();

app.use(express.json());
app.use(helmet()); // security headers
app.use(morgan("dev")); // API logging

// Routes
app.use("/api/companies", companyRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
