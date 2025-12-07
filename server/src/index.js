const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Ensure JWT_SECRET is set with a default value for development
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "default_jwt_secret_change_in_production_2024";
  console.warn(
    "WARNING: JWT_SECRET not found in environment variables. Using default secret. Please set JWT_SECRET in .env file!"
  );
}

// Connect to Database
// We call this but let the server start regardless
connectDB();

const app = express();

// Middleware
// Allow all origins for development to prevent CORS errors
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request Logger
app.use((req, res, next) => {
  //console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/fees", require("./routes/feeRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/finance", require("./routes/financeRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Make uploads folder static
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Root Route
app.get("/", (req, res) => {
  res.send("Jesobantapur Hilful Fuzul API is running...");
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API accessible at http://127.0.0.1:${PORT}`);
});
