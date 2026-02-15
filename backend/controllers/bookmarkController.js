// controllers/bookmarkController.js — CONTROLLER LAYER
// Handles HTTP lifecycle: read request → call model → format response
// No Mongoose queries here — model owns all DB logic
import { validationResult } from "express-validator";
import Bookmark from "../models/Bookmark.js";
import { fetchPageTitle } from "../services/metaFetcher.js";

// ── Helper: map Mongoose validation errors to our format ───────────────────────
const mongooseValidationErrors = (err) =>
  Object.values(err.errors).map((e) => ({ field: e.path, msg: e.message }));

/**
 * GET /api/bookmarks
 * Query: ?tag=value  — filter by tag
 *        ?search=q   — server-side text search
 *        ?page=1&limit=10 — pagination
 */
export const getBookmarks = async (req, res) => {
  const { tag, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (tag) {
    query.tags = tag.toLowerCase();
  }

  if (search) {
    // MongoDB text index search (title, description, url weighted)
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [bookmarks, total] = await Promise.all([
    Bookmark.find(query)
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean({ virtuals: false }),
    Bookmark.countDocuments(query),
  ]);

  // Normalize _id → id for client
  const data = bookmarks.map((b) => ({
    ...b,
    id: b._id.toString(),
    _id: undefined,
    __v: undefined,
  }));

  res.status(200).json({
    success: true,
    count: data.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data,
  });
};

/**
 * GET /api/bookmarks/:id
 */
export const getBookmark = async (req, res) => {
  const bookmark = await Bookmark.findById(req.params.id);
  if (!bookmark) {
    return res.status(404).json({ success: false, message: "Bookmark not found" });
  }
  res.status(200).json({ success: true, data: bookmark });
};

/**
 * POST /api/bookmarks
 * Body: { url, title?, description?, tags? }
 * Bonus: auto-fetches title from URL if title is omitted
 */
export const createBookmark = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  let { url, title, description, tags } = req.body;

  // Bonus: auto-fetch title when not supplied
  if (!title || !title.trim()) {
    title = await fetchPageTitle(url);
  }

  try {
    const bookmark = await Bookmark.create({ url, title, description, tags });
    res.status(201).json({ success: true, data: bookmark });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: mongooseValidationErrors(err),
      });
    }
    throw err; // re-throw to global error handler
  }
};

/**
 * PUT /api/bookmarks/:id
 * Partial update — only supplied fields are changed
 */
export const updateBookmark = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const allowedFields = ["url", "title", "description", "tags"];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  try {
    const bookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!bookmark) {
      return res.status(404).json({ success: false, message: "Bookmark not found" });
    }

    res.status(200).json({ success: true, data: bookmark });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: mongooseValidationErrors(err),
      });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid bookmark ID" });
    }
    throw err;
  }
};

/**
 * DELETE /api/bookmarks/:id
 */
export const deleteBookmark = async (req, res) => {
  const bookmark = await Bookmark.findByIdAndDelete(req.params.id);
  if (!bookmark) {
    return res.status(404).json({ success: false, message: "Bookmark not found" });
  }
  res.status(200).json({ success: true, message: "Bookmark deleted", id: req.params.id });
};

/**
 * GET /api/bookmarks/fetch-title?url=...
 * Bonus: auto-fetch page title from any URL
 */
export const fetchTitle = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ success: false, message: "url query param required" });
  }
  const title = await fetchPageTitle(url);
  res.status(200).json({ success: true, title });
};