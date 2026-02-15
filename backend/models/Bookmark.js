// models/Bookmark.js — MODEL LAYER (Mongoose)
import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
      maxlength: [2000, "URL cannot exceed 2000 characters"],
      validate: {
        validator: (v) => /^https?:\/\/.+/.test(v),
        message: "Must be a valid URL starting with http:// or https://",
      },
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (arr) => arr.length <= 5,
          message: "A bookmark can have at most 5 tags",
        },
        {
          validator: (arr) => arr.every((t) => t === t.toLowerCase()),
          message: "All tags must be lowercase",
        },
        {
          validator: (arr) => arr.every((t) => t.length <= 30),
          message: "Each tag must be 30 characters or fewer",
        },
      ],
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
bookmarkSchema.index({ tags: 1 });
bookmarkSchema.index({ createdAt: -1 });
bookmarkSchema.index(
  { title: "text", description: "text", url: "text" },
  { weights: { title: 3, description: 1, url: 2 }, name: "bookmark_text_idx" }
);

// ── Pre-save: normalize tags ───────────────────────────────────────────────────
// Mongoose 8: use async pre-save instead of next() callback (next is deprecated)
bookmarkSchema.pre("save", async function () {
  this.tags = [...new Set(this.tags.map((t) => t.trim().toLowerCase()))];
});

// ── Static: find by tag ────────────────────────────────────────────────────────
bookmarkSchema.statics.findByTag = function (tag) {
  return this.find({ tags: tag }).sort({ createdAt: -1 });
};

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export default Bookmark;