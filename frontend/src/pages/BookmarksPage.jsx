
import { useState, useMemo } from "react";
import {
  Search, Plus, SunMedium, Moon, Bookmark,
  X, Tag, AlertCircle, RefreshCw, Database,
} from "lucide-react";
import { useBookmarks } from "../hooks/useBookmarks.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import BookmarkCard from "../components/BookmarkCard.jsx";
import BookmarkForm from "../components/BookmarkForm.jsx";


const Skeleton = () => (
  <div className="bg-white dark:bg-[var(--color-dark-surface)] border border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)] rounded-xl p-5 animate-pulse">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-4 h-4 rounded bg-[var(--color-paper-3)] dark:bg-[var(--color-dark-border)]" />
      <div className="h-3 w-28 rounded bg-[var(--color-paper-3)] dark:bg-[var(--color-dark-border)]" />
    </div>
    <div className="h-4 w-3/4 rounded bg-[var(--color-paper-3)] dark:bg-[var(--color-dark-border)] mb-2" />
    <div className="h-3 w-full rounded bg-[var(--color-paper-2)] dark:bg-[var(--color-dark-bg)] mb-1.5" />
    <div className="h-3 w-2/3 rounded bg-[var(--color-paper-2)] dark:bg-[var(--color-dark-bg)] mb-4" />
    <div className="flex gap-2">
      <div className="h-5 w-14 rounded-full bg-[var(--color-paper-3)] dark:bg-[var(--color-dark-border)]" />
      <div className="h-5 w-16 rounded-full bg-[var(--color-paper-3)] dark:bg-[var(--color-dark-border)]" />
    </div>
  </div>
);


const inputCls = [
  "px-4 py-2.5 rounded-xl border text-sm outline-none transition-all",
  "bg-white dark:bg-[var(--color-dark-surface)]",
  "border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)]",
  "text-[var(--color-ink)] dark:text-[var(--color-dark-text)]",
  "placeholder-[var(--color-ink-4)] dark:placeholder-[var(--color-dark-text-2)]",
  "focus:border-[var(--color-ink-2)] dark:focus:border-[var(--color-dark-text-2)]",
  "focus:ring-2 focus:ring-[var(--color-ink)]/5",
].join(" ");


export default function BookmarksPage() {
  const { dark, toggle } = useTheme();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [showForm, setShowForm] = useState(false);


  const { data, isLoading, isError, error, refetch } = useBookmarks(
    activeTag ? { tag: activeTag } : {}
  );

  const bookmarks = data?.bookmarks ?? [];


  const filtered = useMemo(() => {
    if (!search.trim()) return bookmarks;
    const q = search.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q)
    );
  }, [bookmarks, search]);


  const allTags = useMemo(() => {
    const set = new Set();
    bookmarks.forEach((b) => b.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [bookmarks]);

  const handleTagClick = (tag) =>
    setActiveTag((prev) => (prev === tag ? "" : tag));

  const summaryText = () => {
    if (filtered.length === 0) return "No bookmarks found";
    const parts = [`${filtered.length} bookmark${filtered.length !== 1 ? "s" : ""}`];
    if (activeTag) parts.push(`tagged "${activeTag}"`);
    if (search) parts.push(`matching "${search}"`);
    return parts.join(" ");
  };

  const btnBase = "p-2 rounded-lg transition-colors text-[var(--color-ink-3)] dark:text-[var(--color-dark-text-2)] hover:text-[var(--color-ink)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-paper-2)] dark:hover:bg-[var(--color-dark-surface)]";

  return (
    <div className="min-h-screen bg-[var(--color-paper)] dark:bg-[var(--color-dark-bg)] transition-colors">


      <header className="sticky top-0 z-40 border-b border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)] bg-[var(--color-paper)]/90 dark:bg-[var(--color-dark-bg)]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">


          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-ink)] dark:bg-[var(--color-dark-text)] flex items-center justify-center">
              <Bookmark size={14} className="text-[var(--color-paper)] dark:text-[var(--color-ink)]" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-serif text-base text-[var(--color-ink)] dark:text-[var(--color-dark-text)]">Bookmarks</span>
              <span className="text-[10px] text-[var(--color-ink-4)] dark:text-[var(--color-dark-text-2)] flex items-center gap-1">
                <Database size={9} />
                MongoDB
              </span>
            </div>
          </div>


          <div className="flex-1 relative max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-4)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, URL, description..."
              className={`${inputCls} w-full pl-10 pr-8`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-4)] hover:text-[var(--color-ink)] dark:hover:text-[var(--color-dark-text)] transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggle} className={btnBase} title="Toggle theme">
              {dark ? <SunMedium size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-ink)] dark:bg-[var(--color-dark-text)] text-[var(--color-paper)] dark:text-[var(--color-ink)] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Add bookmark</span>
            </button>
          </div>
        </div>
      </header>


      <main className="max-w-5xl mx-auto px-6 py-8">


        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-4)] dark:text-[var(--color-dark-text-2)] mr-1">
              <Tag size={12} />
              <span>Filter by tag:</span>
            </div>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  activeTag === tag
                    ? "bg-[var(--color-ink)] dark:bg-[var(--color-dark-text)] text-[var(--color-paper)] dark:text-[var(--color-ink)] border-transparent"
                    : "border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)] text-[var(--color-ink-2)] dark:text-[var(--color-dark-text-2)] hover:border-[var(--color-ink-3)]"
                }`}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag("")}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-[var(--color-danger)] border border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-light)] transition-colors"
              >
                <X size={11} />
                Clear
              </button>
            )}
          </div>
        )}


        {!isLoading && !isError && (
          <p className="text-xs text-[var(--color-ink-4)] dark:text-[var(--color-dark-text-2)] mb-5">
            {summaryText()}
          </p>
        )}


        {isError && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--color-danger-light)] flex items-center justify-center">
              <AlertCircle size={22} className="text-[var(--color-danger)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--color-ink)] dark:text-[var(--color-dark-text)] mb-1">
                Failed to load bookmarks
              </p>
              <p className="text-sm text-[var(--color-ink-3)] dark:text-[var(--color-dark-text-2)]">
                {error?.message || "Check that the API and MongoDB are running."}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-paper-3)] dark:border-[var(--color-dark-border)] text-sm text-[var(--color-ink-2)] dark:text-[var(--color-dark-text-2)] hover:bg-[var(--color-paper-2)] dark:hover:bg-[var(--color-dark-surface)] transition-colors"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}


        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        )}


        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-paper-2)] dark:bg-[var(--color-dark-surface)] flex items-center justify-center">
              <Bookmark size={24} className="text-[var(--color-ink-4)]" />
            </div>
            <div>
              <p className="font-serif text-lg text-[var(--color-ink)] dark:text-[var(--color-dark-text)] mb-1">
                {search || activeTag ? "No results found" : "No bookmarks yet"}
              </p>
              <p className="text-sm text-[var(--color-ink-3)] dark:text-[var(--color-dark-text-2)]">
                {search || activeTag
                  ? "Try a different search or clear the filter."
                  : "Add your first bookmark to get started."}
              </p>
            </div>
            {!search && !activeTag && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-ink)] dark:bg-[var(--color-dark-text)] text-[var(--color-paper)] dark:text-[var(--color-ink)] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={15} />
                Add bookmark
              </button>
            )}
          </div>
        )}


        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((bm) => (
              <BookmarkCard
                key={bm.id}
                bookmark={bm}
                activeTag={activeTag}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && <BookmarkForm onClose={() => setShowForm(false)} />}
    </div>
  );
}