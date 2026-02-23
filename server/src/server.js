import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();


// ROUTES

// Check if the server is running
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Auth routes
app.use("/api/auth", authRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Server error",
  });
});


// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});