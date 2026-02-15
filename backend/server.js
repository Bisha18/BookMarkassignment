// server.js — Entry Point
// Connects MongoDB then starts Express. Auto-seeds on first run.
import "express-async-error";
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import Bookmark from "./models/Bookmark.js";

const PORT = process.env.PORT || 3001;

const SEED_DATA = [
  {
    url: "https://developer.mozilla.org",
    title: "MDN Web Docs",
    description: "Comprehensive documentation for HTML, CSS, JavaScript, and Web APIs.",
    tags: ["docs", "javascript", "web"],
  },
  {
    url: "https://react.dev",
    title: "React — The Library for Web and Native User Interfaces",
    description: "Official React documentation covering hooks, components, and React 19 features.",
    tags: ["react", "javascript", "frontend"],
  },
  {
    url: "https://tailwindcss.com",
    title: "Tailwind CSS — Utility-First CSS Framework",
    description: "Rapidly build modern websites without ever leaving your HTML.",
    tags: ["css", "frontend", "design"],
  },
  {
    url: "https://expressjs.com",
    title: "Express — Fast Node.js Web Framework",
    description: "Minimal and flexible Node.js web application framework for building APIs.",
    tags: ["nodejs", "backend", "api"],
  },
  {
    url: "https://www.mongodb.com/docs",
    title: "MongoDB Documentation",
    description: "Official MongoDB docs: CRUD, aggregation, indexing, and Atlas cloud.",
    tags: ["mongodb", "database", "backend"],
  },
  {
    url: "https://mongoosejs.com",
    title: "Mongoose — MongoDB Object Modeling for Node.js",
    description: "Schema-based solution to model data with type casting, validation, and query building.",
    tags: ["mongoose", "mongodb", "nodejs"],
  },
];

const start = async () => {
  await connectDB();

  // Auto-seed if collection is empty
  const count = await Bookmark.countDocuments();
  if (count === 0) {
    await Bookmark.insertMany(SEED_DATA);
    console.log(`[Server] Auto-seeded ${SEED_DATA.length} bookmarks`);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Bookmark Manager API  →  http://localhost:${PORT}`);
    console.log(`[Server] MongoDB URI            →  ${process.env.MONGO_URI}`);
  });
};

start().catch((err) => {
  console.error("[Server] Failed to start:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("[Server] Unhandled rejection:", err.message);
  process.exit(1);
});