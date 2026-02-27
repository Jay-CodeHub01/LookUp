import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import morgan from "morgan";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// -------- MIDDLEWARE --------
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));


// -------- ROUTES --------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// -------- HEALTH CHECK --------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🔍 LookUp API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      posts: "/api/posts",
    },
  });
});

// -------- 404 HANDLER --------
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

// -------- GLOBAL ERROR HANDLER --------
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// -------- START SERVER --------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🔍 LookUp Server running on port ${PORT}`);
  console.log(`📡 http://localhost:${PORT}\n`);
});