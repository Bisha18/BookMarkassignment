# Bookmark Manager — MERN Stack

A full-stack bookmark manager built on **MongoDB, Express, React 19, Node.js** with strict MVC architecture on the backend.

---

## Quick Start


**Prerequisites:**
- Node.js 18+
- MongoDB running locally on `localhost:27017`
  (or set `MONGO_URI` in `backend/.env` to a MongoDB Atlas URI)

| Service  | URL                                           |
|----------|-----------------------------------------------|
| API      | http://localhost:3001                         |
| Frontend | http://localhost:5173                         |
| MongoDB  | mongodb://localhost:27017/bookmark_manager    |

---

## Project Structure

```
bookmark-manager-mern/
├── start.sh                       # One-command startup
├── package.json                   # Root — concurrently runs both
│
├── backend/                       # Express MVC REST API
│   ├── server.js                  # Entry: connects MongoDB, auto-seeds, starts Express
│   ├── app.js                     # Express + middleware registration
│   ├── .env.example               # Copy to .env and set MONGO_URI
│   │
│   ├── config/
│   │   ├── db.js                  # Mongoose connection with graceful shutdown
│   │   └── seed.js                # Manual seed script (npm run seed)
│   │
│   ├── models/
│   │   └── Bookmark.js            # Mongoose schema, validation, indexes, statics
│   │
│   ├── controllers/
│   │   └── bookmarkController.js  # Request handling → model → JSON response
│   │
│   ├── routes/
│   │   └── bookmarkRoutes.js      # URL + verb → middleware → controller
│   │
│   ├── middleware/
│   │   ├── validationMiddleware.js  # express-validator rules
│   │   ├── errorMiddleware.js       # Mongoose-aware global error handler
│   │   └── rateLimitMiddleware.js   # 200 req / 15 min per IP
│   │
│   ├── services/
│   │   └── metaFetcher.js          # Bonus: fetch <title> from any URL
│   │
│   └── tests/
│       └── bookmarks.test.js       # Jest + Supertest — GET, POST, PUT, DELETE
│
└── frontend/                      # React 19 + Tailwind CSS v4
    ├── index.html
    ├── vite.config.js
    │
    └── src/
        ├── main.jsx               # React 19 createRoot
        ├── App.jsx
        ├── index.css              # Tailwind v4 + CSS design tokens
        │
        ├── context/
        │   └── ThemeContext.jsx   # Dark mode + localStorage persistence
        │
        ├── services/
        │   └── api.js             # Axios instance + all bookmark endpoints
        │
        ├── hooks/
        │   └── useBookmarks.js    # TanStack Query wrappers
        │
        ├── components/
        │   ├── BookmarkCard.jsx   # Card with inline edit/delete
        │   └── BookmarkForm.jsx   # Create/edit modal
        │
        └── pages/
            └── BookmarksPage.jsx  # Main page: search, tag filter, grid
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/bookmark_manager
NODE_ENV=development
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/bookmark_manager
```

---

## API Reference

**Base URL:** `http://localhost:3001/api`

All responses use envelope format:
```json
{ "success": true, "data": ..., "count": 0, "total": 0 }
```

### GET /bookmarks

Returns all bookmarks, newest first.

| Query Param | Type   | Description                     |
|-------------|--------|---------------------------------|
| `tag`       | string | Filter by exact tag             |
| `search`    | string | MongoDB text search             |
| `page`      | number | Page number (default: 1)        |
| `limit`     | number | Results per page (default: 20)  |

**Response 200:**
```json
{
  "success": true,
  "count": 6,
  "total": 6,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "id": "6840abc...",
      "url": "https://developer.mozilla.org",
      "title": "MDN Web Docs",
      "description": "...",
      "tags": ["docs", "javascript"],
      "createdAt": "2025-06-01T12:00:00.000Z",
      "updatedAt": "2025-06-01T12:00:00.000Z"
    }
  ]
}
```

### POST /bookmarks

```
POST /api/bookmarks
Content-Type: application/json

{
  "url": "https://example.com",      // required
  "title": "Example",                // optional — auto-fetched from URL if omitted
  "description": "A description",    // optional, max 500 chars
  "tags": ["example", "web"]         // optional, max 5, lowercase
}
```

**201** Created | **400** Validation errors

### PUT /bookmarks/:id

Partial update — only provided fields change.

```
PUT /api/bookmarks/:id
Content-Type: application/json

{ "title": "Updated Title", "tags": ["updated"] }
```

**200** Updated | **404** Not found | **400** Validation error

### DELETE /bookmarks/:id

```
DELETE /api/bookmarks/:id
```

**200** `{ success: true, message: "Bookmark deleted", id: "..." }` | **404** Not found

### GET /bookmarks/fetch-title?url=...

Auto-fetches `<title>` tag from any URL (4s timeout, falls back to hostname).

```
GET /api/bookmarks/fetch-title?url=https://github.com
→ { "success": true, "title": "GitHub · Build and ship software on a single, collaborative platform" }
```

---

## Running Tests

```bash
npm test
# or: cd backend && npm test
```

Tests run against `bookmark_manager_test` database (dropped after each suite).

Covers:
- `GET /bookmarks` — 200, count accuracy, tag filtering, empty results
- `POST /bookmarks` — 201, missing URL, invalid URL, title overflow, >5 tags, uppercase tags
- `DELETE /bookmarks/:id` — 200, 404 (valid ObjectId), 400 (malformed ID)
- `PUT /bookmarks/:id` — 200, 404

---

## Design Decisions

### Backend

**MongoDB + Mongoose over SQLite**
MongoDB is the M in MERN. Mongoose provides schema-level validation, pre-save hooks, virtual fields, compound indexes, and a text index for full-text search — all without a separate DB service if running locally. The document model maps naturally to the bookmark shape (arrays of tags, flexible description).

**Mongoose schema validation vs. express-validator**
Both layers validate. `express-validator` catches bad inputs before hitting the DB (fast 400 response). Mongoose schema validators act as a safety net and handle edge cases like the tag uniqueness de-duplication in the `pre("save")` hook.

**Text index for search**
The Mongoose model defines a compound text index on `title` (weight 3), `url` (weight 2), `description` (weight 1). When `?search=` is provided, MongoDB scores results by relevance. For simple tag filtering, a standard array index on `tags` is used.

**Auto-seed on first start**
`server.js` checks `Bookmark.countDocuments()` on startup and inserts 6 seed bookmarks if the collection is empty. No separate seed command needed for first-run experience.

**`toJSON` transform**
The schema's `toJSON` transform converts `_id` → `id` and strips `__v`, so the client always receives clean `id` strings — no MongoDB internals leak through the API.

### Frontend

**Tag filter = server-side, Search = client-side**
Tag filtering sends `?tag=` to the API so MongoDB handles it efficiently via index. Free-text search runs client-side via `useMemo` over already-loaded data — no debounce needed, zero round-trips per keystroke.

**TanStack Query v5**
Handles caching, background refetch, and mutation invalidation. The `bookmarkKeys` factory ensures precise cache invalidation without over-fetching.

**Dark mode**
Implemented with a CSS class toggle on `<body>` (`dark`) combined with CSS custom properties. `ThemeContext` persists preference to `localStorage` and respects `prefers-color-scheme` on first visit.

**MongoDB brand accent color**
The accent color `#00684a` is MongoDB's official green, subtly tying the UI to the stack without being heavy-handed. The `Database` icon in the header label confirms "MongoDB" to the developer.

---

## Bonus Features

| Feature | Where |
|---------|-------|
| Auto-fetch page title from URL | `services/metaFetcher.js`, blur event on URL input |
| Dark mode toggle | `ThemeContext`, header button |
| Rate limiting (200/15min) | `middleware/rateLimitMiddleware.js` |
| Unit tests (Jest + Supertest) | `backend/tests/bookmarks.test.js` |
| MongoDB text index search | `?search=` query param |
| Pagination support | `?page=&limit=` query params |
| Favicon per domain | Google S2 API in `BookmarkCard` |
| Graceful MongoDB shutdown | SIGINT handler in `config/db.js` |
