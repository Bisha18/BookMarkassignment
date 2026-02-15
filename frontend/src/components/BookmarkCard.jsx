// src/components/BookmarkCard.jsx
import { useState } from "react";
import { ExternalLink, Pencil, Trash2, Loader2 } from "lucide-react";
import { useDeleteBookmark } from "../hooks/useBookmarks.jsx";
import BookmarkForm from "./BookmarkForm.jsx";

// Deterministic color per tag
const TAG_COLORS = [
  "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
];

const tagColor = (tag) => {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
  return TAG_COLORS[Math.abs(h) % TAG_COLORS.length];
};

const domain = (url) => {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function BookmarkCard({ bookmark, activeTag, onTagClick }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const del = useDeleteBookmark();

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    await del.mutateAsync(bookmark.id);
  };

  const snippet =
    bookmark.description?.length > 110
      ? bookmark.description.slice(0, 110) + "..."
      : bookmark.description;

  const host = domain(bookmark.url);

  return (
    <>
      <article className="group relative flex flex-col bg-white dark:bg-[var(--color-dark-surface)] border border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)] rounded-xl p-5 hover:border-[var(--color-ink-4)] dark:hover:border-[var(--color-dark-text-2)] transition-all duration-150 hover:shadow-sm animate-slide-up">

        {/* Meta row: favicon + domain + date + actions */}
        <div className="flex items-center gap-2 mb-3 min-w-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`}
            alt=""
            className="w-4 h-4 rounded-sm shrink-0 opacity-70"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <span className="text-xs text-[var(--color-ink-4)] dark:text-[var(--color-dark-text-2)] font-mono truncate">
            {host}
          </span>
          <span className="text-[var(--color-paper-3)] dark:text-[var(--color-dark-border)] text-xs shrink-0">·</span>
          <span className="text-xs text-[var(--color-ink-4)] dark:text-[var(--color-dark-text-2)] shrink-0">
            {formatDate(bookmark.createdAt)}
          </span>

          {/* Hover actions */}
          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-md text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] dark:hover:bg-[var(--color-dark-bg)] transition-colors"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={handleDelete}
              onBlur={() => setConfirming(false)}
              disabled={del.isPending}
              className={`p-1.5 rounded-md transition-colors ${
                confirming
                  ? "text-[var(--color-danger)] bg-[var(--color-danger-light)]"
                  : "text-[var(--color-ink-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] dark:hover:bg-[var(--color-dark-bg)]"
              }`}
              title={confirming ? "Click again to confirm delete" : "Delete"}
            >
              {del.isPending
                ? <Loader2 size={13} className="animate-spin" />
                : <Trash2 size={13} />}
            </button>
          </div>
        </div>

        {/* Title — clickable, opens URL */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link flex items-start gap-1 mb-2"
        >
          <h3 className="font-serif text-[15px] leading-snug text-[var(--color-ink)] dark:text-[var(--color-dark-text)] group-hover/link:text-[var(--color-accent)] transition-colors line-clamp-2">
            {bookmark.title}
          </h3>
          <ExternalLink
            size={11}
            className="shrink-0 mt-1 text-[var(--color-ink-4)] opacity-0 group-hover/link:opacity-100 transition-opacity"
          />
        </a>

        {/* Description snippet */}
        {snippet && (
          <p className="text-sm text-[var(--color-ink-3)] dark:text-[var(--color-dark-text-2)] leading-relaxed line-clamp-2 mb-3">
            {snippet}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {bookmark.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${tagColor(tag)} ${
                  activeTag === tag ? "ring-1 ring-offset-1 ring-current" : ""
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </article>

      {editing && <BookmarkForm bookmark={bookmark} onClose={() => setEditing(false)} />}
    </>
  );
}