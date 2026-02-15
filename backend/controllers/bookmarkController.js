import { validationResult } from "express-validator";
import Bookmark from "../models/Bookmark.js";
import { fetchPageTitle } from "../services/metaFetcher.js";

const formatMongooseErrors = (err) =>
  Object.values(err.errors).map((e) => ({ field: e.path, msg: e.message }));


export const getBookmarks = async (req, res) => {
  const { tag, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (tag) filter.tags = tag.toLowerCase().trim();
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const sortBy = search ? { score: { $meta: "textScore" } } : { createdAt: -1 };

  const [docs, total] = await Promise.all([
    Bookmark.find(filter).sort(sortBy).skip(skip).limit(Number(limit)),
    Bookmark.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: docs.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: docs,
  });
};

export const getBookmark = async (req, res) => {
  const bookmark = await Bookmark.findById(req.params.id);
  if (!bookmark) {
    return res.status(404).json({ success: false, message: "Bookmark not found" });
  }
  res.status(200).json({ success: true, data: bookmark });
};

/**
 * POST /api/bookmarks
 * Auto-fetches title from URL when title is omitted
 */
export const createBookmark = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  let { url, title, description, tags } = req.body;

  // Bonus: auto-fetch title if missing
  if (!title || !title.trim()) {
    title = await fetchPageTitle(url);
  }

  try {
    const bookmark = await Bookmark.create({ url, title, description, tags });
    return res.status(201).json({ success: true, data: bookmark });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatMongooseErrors(err),
      });
    }
    throw err;
  }
};

export const updateBookmark = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const allowed = ["url", "title", "description", "tags"];
  const updates = {};
  allowed.forEach((f) => {
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
    return res.status(200).json({ success: true, data: bookmark });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatMongooseErrors(err),
      });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid bookmark ID" });
    }
    throw err;
  }
};

export const deleteBookmark = async (req, res) => {
  const bookmark = await Bookmark.findByIdAndDelete(req.params.id);
  if (!bookmark) {
    return res.status(404).json({ success: false, message: "Bookmark not found" });
  }
  return res.status(200).json({
    success: true,
    message: "Bookmark deleted",
    id: req.params.id,
  });
};

export const fetchTitle = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ success: false, message: "url query param required" });
  }
  const title = await fetchPageTitle(url);
  return res.status(200).json({ success: true, title });
};