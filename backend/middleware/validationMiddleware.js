// middleware/validationMiddleware.js
import { body } from "express-validator";

const urlRule = (optional = false) => {
  const f = body("url");
  const base = optional
    ? f.optional()
    : f.notEmpty().withMessage("URL is required");
  return base
    .matches(/^https?:\/\/.+/)
    .withMessage("Must be a valid URL starting with http:// or https://")
    .isLength({ max: 2000 })
    .withMessage("URL too long (max 2000 chars)");
};

const titleRule = (optional = false) => {
  const f = body("title");
  const base = optional ? f.optional() : f; // title optional on create — auto-fetched
  return base
    .optional()
    .isLength({ max: 200 })
    .withMessage("Title max 200 characters")
    .trim();
};

const descriptionRule = () =>
  body("description")
    .optional({ nullable: true })
    .isLength({ max: 500 })
    .withMessage("Description max 500 characters")
    .trim();

const tagsRule = () =>
  body("tags")
    .optional({ nullable: true })
    .isArray({ max: 5 })
    .withMessage("Tags must be an array of up to 5 items")
    .custom((tags) => {
      if (!Array.isArray(tags)) return true;
      for (const t of tags) {
        if (typeof t !== "string") throw new Error("Each tag must be a string");
        if (t.trim() !== t.trim().toLowerCase())
          throw new Error("Tags must be lowercase");
        if (t.length > 30) throw new Error("Each tag max 30 characters");
      }
      return true;
    });

export const validateCreate = [urlRule(), titleRule(), descriptionRule(), tagsRule()];
export const validateUpdate = [urlRule(true), titleRule(true), descriptionRule(), tagsRule()];