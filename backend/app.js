
import "express-async-error";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimitMiddleware.js";

const app = express();


app.use(cors({
   origin:"*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}


app.use("/api", apiLimiter);


app.use("/api/bookmarks", bookmarkRoutes);


app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", db: "mongodb", timestamp: new Date().toISOString() });
});


app.use(notFound);
app.use(errorHandler);

export default app;