import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./db.js";
import Bookmark from "../models/Bookmark.js";

const SEED_DATA = [
  {
    url: "https://developer.mozilla.org",
    title: "MDN Web Docs",
    description:
      "Comprehensive documentation for HTML, CSS, JavaScript, and Web APIs. The definitive reference for web developers.",
    tags: ["docs", "javascript", "web"],
  },
  {
    url: "https://react.dev",
    title: "React — The Library for Web and Native User Interfaces",
    description:
      "Official React documentation covering hooks, components, state management, and React 19 features.",
    tags: ["react", "javascript", "frontend"],
  },
  {
    url: "https://tailwindcss.com",
    title: "Tailwind CSS — A Utility-First CSS Framework",
    description:
      "Rapidly build modern websites without ever leaving your HTML. A utility-first CSS framework packed with classes.",
    tags: ["css", "frontend", "design"],
  },
  {
    url: "https://expressjs.com",
    title: "Express — Fast, Unopinionated Web Framework for Node.js",
    description:
      "Minimal and flexible Node.js web application framework with a robust set of features for building APIs.",
    tags: ["nodejs", "backend", "api"],
  },
  {
    url: "https://www.mongodb.com/docs",
    title: "MongoDB Documentation",
    description:
      "Official MongoDB documentation covering CRUD operations, aggregation pipeline, indexing, and Atlas cloud features.",
    tags: ["mongodb", "database", "backend"],
  },
  {
    url: "https://mongoosejs.com",
    title: "Mongoose — Elegant MongoDB Object Modeling for Node.js",
    description:
      "Mongoose provides a schema-based solution to model application data with built-in type casting, validation, and query building.",
    tags: ["mongoose", "mongodb", "nodejs"],
  },
];

const seed = async () => {
  await connectDB();

  const existing = await Bookmark.countDocuments();
  if (existing > 0) {
    console.log(`[Seed] Database already has ${existing} bookmarks. Skipping seed.`);
    console.log("[Seed] To re-seed, drop the collection first.");
  } else {
    await Bookmark.insertMany(SEED_DATA);
    console.log(`[Seed] Inserted ${SEED_DATA.length} seed bookmarks.`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("[Seed] Failed:", err.message);
  process.exit(1);
});