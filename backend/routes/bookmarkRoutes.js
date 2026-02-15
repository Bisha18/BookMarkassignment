
import { Router } from "express";
import {
  getBookmarks,
  getBookmark,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  fetchTitle,
} from "../controllers/bookmarkController.js";
import { validateCreate, validateUpdate } from "../middleware/validationMiddleware.js";

const router = Router();

// Utility (must come before /:id to avoid conflicts)
router.get("/fetch-title", fetchTitle);

// REST CRUD
router.get("/", getBookmarks);
router.post("/", validateCreate, createBookmark);

router.get("/:id", getBookmark);
router.put("/:id", validateUpdate, updateBookmark);
router.delete("/:id", deleteBookmark);

export default router;