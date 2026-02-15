// app.js — Express Application
// express-async-errors must be imported first — it patches Express's router
// so any async route that throws will automatically call next(err)
import "express-async-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimitMiddleware.js";

const app = express();

// ── Core Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ── Rate Limiting ──────────────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/bookmarks", bookmarkRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", db: "mongodb", timestamp: new Date().toISOString() });
});

// ── Error Handlers — must be LAST, after all routes ───────────────────────────
app.use(notFound);
app.use(errorHandler);   // 4-param signature: (err, req, res, next)

export default app;