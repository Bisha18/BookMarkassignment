// src/components/BookmarkForm.jsx
import { useState } from "react";
import { X, Link2, FileText, AlignLeft, Tag, Loader2, Sparkles } from "lucide-react";
import { useCreateBookmark, useUpdateBookmark, useFetchTitle } from "../hooks/useBookmarks.jsx";

const INITIAL = { url: "", title: "", description: "", tags: "" };

const isValidUrl = (str) => {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch { return false; }
};

const cls = {
  label: "block text-[11px] font-medium uppercase tracking-widest text-[var(--color-ink-4)] dark:text-[var(--color-dark-text-2)] mb-1.5",
  input: [
    "w-full px-3 py-2.5 pl-9 rounded-lg border text-sm outline-none transition-all",
    "bg-white dark:bg-[var(--color-dark-surface)]",
    "border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)]",
    "text-[var(--color-ink)] dark:text-[var(--color-dark-text)]",
    "placeholder-[var(--color-ink-4)] dark:placeholder-[var(--color-dark-text-2)]",
    "focus:border-[var(--color-ink-2)] dark:focus:border-[var(--color-dark-text-2)]",
    "focus:ring-2 focus:ring-[var(--color-ink)]/5",
  ].join(" "),
  error: "text-xs text-[var(--color-danger)] mt-1",
};

export default function BookmarkForm({ bookmark, onClose }) {
  const isEdit = !!bookmark;
  const [form, setForm] = useState(
    bookmark
      ? { ...bookmark, tags: bookmark.tags.join(", ") }
      : INITIAL
  );
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const create = useCreateBookmark();
  const update = useUpdateBookmark();
  const fetchTitle = useFetchTitle();
  const busy = create.isPending || update.isPending;

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleAutoFetch = async () => {
    if (!isValidUrl(form.url)) {
      setErrors((p) => ({ ...p, url: "Enter a valid URL first" }));
      return;
    }
    try {
      const res = await fetchTitle.mutateAsync(form.url);
      if (res.title) setForm((p) => ({ ...p, title: res.title }));
    } catch { /* silent */ }
  };

  const validate = () => {
    const e = {};
    if (!form.url.trim()) e.url = "URL is required";
    else if (!isValidUrl(form.url)) e.url = "Must be a valid http/https URL";
    if (form.title.length > 200) e.title = "Max 200 characters";
    if (form.description.length > 500) e.description = "Max 500 characters";
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length > 5) e.tags = "Max 5 tags";
    if (tags.some((t) => t !== t.toLowerCase())) e.tags = "Tags must be lowercase";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      url: form.url.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
    };

    try {
      if (isEdit) await update.mutateAsync({ id: bookmark.id, data: payload });
      else await create.mutateAsync(payload);
      onClose();
    } catch (err) {
      setApiError(err.message);
    }
  };

  const IconInput = ({ icon: Icon, field, type = "text", placeholder, children }) => (
    <div>
      {children}
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-4)] pointer-events-none" />
        <input
          type={type}
          value={form[field]}
          onChange={set(field)}
          onBlur={field === "url" ? handleAutoFetch : undefined}
          placeholder={placeholder}
          className={cls.input}
        />
      </div>
      {errors[field] && <p className={cls.error}>{errors[field]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[var(--color-paper)] dark:bg-[var(--color-dark-surface)] rounded-2xl border border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)] shadow-2xl animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)]">
          <h2 className="font-serif text-xl text-[var(--color-ink)] dark:text-[var(--color-dark-text)]">
            {isEdit ? "Edit bookmark" : "New bookmark"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] dark:hover:bg-[var(--color-dark-bg)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {apiError && (
            <div className="px-3 py-2.5 rounded-lg bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
              {apiError}
            </div>
          )}

          {/* URL */}
          <IconInput icon={Link2} field="url" placeholder="https://example.com">
            <label className={cls.label}>URL</label>
          </IconInput>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={cls.label} style={{ marginBottom: 0 }}>Title</label>
              <button
                type="button"
                onClick={handleAutoFetch}
                disabled={fetchTitle.isPending}
                className="flex items-center gap-1 text-xs text-[var(--color-ink-3)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-50"
              >
                {fetchTitle.isPending
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Sparkles size={12} />}
                Auto-fetch
              </button>
            </div>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-4)] pointer-events-none" />
              <input
                type="text"
                value={form.title}
                onChange={set("title")}
                placeholder="Page title (auto-fetched if blank)"
                className={cls.input}
              />
            </div>
            {errors.title && <p className={cls.error}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={cls.label}>
              Description <span className="normal-case tracking-normal opacity-60">(optional)</span>
            </label>
            <div className="relative">
              <AlignLeft size={14} className="absolute left-3 top-3 text-[var(--color-ink-4)] pointer-events-none" />
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                placeholder="Short description..."
                className={`${cls.input} resize-none`}
              />
            </div>
            {errors.description && <p className={cls.error}>{errors.description}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className={cls.label}>
              Tags <span className="normal-case tracking-normal opacity-60">(comma-separated, max 5, lowercase)</span>
            </label>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-4)] pointer-events-none" />
              <input
                type="text"
                value={form.tags}
                onChange={set("tags")}
                placeholder="docs, javascript, tools"
                className={cls.input}
              />
            </div>
            {errors.tags && <p className={cls.error}>{errors.tags}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)] text-sm font-medium text-[var(--color-ink-2)] dark:text-[var(--color-dark-text-2)] hover:bg-[var(--color-paper-2)] dark:hover:bg-[var(--color-dark-bg)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-2.5 rounded-lg bg-[var(--color-ink)] dark:bg-[var(--color-dark-text)] text-[var(--color-paper)] dark:text-[var(--color-ink)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save changes" : "Add bookmark"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}