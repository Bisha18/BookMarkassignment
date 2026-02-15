// tests/bookmarks.test.js — API tests using supertest
// Uses the real MongoDB URI from .env (or set TEST_MONGO_URI for isolation)
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import Bookmark from "../models/Bookmark.js";

const MONGO_URI =
  process.env.TEST_MONGO_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/bookmark_manager_test";

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
  // Drop test DB and close
  if (MONGO_URI.includes("_test")) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Bookmark.deleteMany({});
});

// ── GET /api/bookmarks ─────────────────────────────────────────────────────────
describe("GET /api/bookmarks", () => {
  it("returns 200 with success:true and an array", async () => {
    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("count matches data.length", async () => {
    await Bookmark.insertMany([
      { url: "https://a.com", title: "A" },
      { url: "https://b.com", title: "B" },
    ]);
    const res = await request(app).get("/api/bookmarks");
    expect(res.body.count).toBe(res.body.data.length);
    expect(res.body.count).toBe(2);
  });

  it("filters correctly by ?tag=", async () => {
    await Bookmark.create({ url: "https://tagged.com", title: "Tagged", tags: ["merntest"] });
    await Bookmark.create({ url: "https://other.com", title: "Other", tags: ["other"] });

    const res = await request(app).get("/api/bookmarks?tag=merntest");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].tags).toContain("merntest");
  });

  it("returns empty array when no bookmarks match tag", async () => {
    const res = await request(app).get("/api/bookmarks?tag=noresults");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

// ── POST /api/bookmarks ────────────────────────────────────────────────────────
describe("POST /api/bookmarks", () => {
  it("creates bookmark and returns 201 with correct data", async () => {
    const payload = {
      url: "https://example.com/test",
      title: "Test Bookmark",
      description: "A description",
      tags: ["test", "mern"],
    };
    const res = await request(app).post("/api/bookmarks").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe(payload.url);
    expect(res.body.data.title).toBe(payload.title);
    expect(res.body.data.tags).toEqual(["test", "mern"]);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  it("returns 400 when url is missing", async () => {
    const res = await request(app).post("/api/bookmarks").send({ title: "No URL" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 when url is not a valid http/https URL", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .send({ url: "ftp://bad.com", title: "Bad proto" });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toMatch(/valid URL/i);
  });

  it("returns 400 when title exceeds 200 chars", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .send({ url: "https://example.com", title: "T".repeat(201) });
    expect(res.status).toBe(400);
  });

  it("returns 400 when more than 5 tags are given", async () => {
    const res = await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "Too many tags",
      tags: ["a", "b", "c", "d", "e", "f"],
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when tags contain uppercase", async () => {
    const res = await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "Uppercase tags",
      tags: ["ValidTag"],
    });
    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/bookmarks/:id ─────────────────────────────────────────────────
describe("DELETE /api/bookmarks/:id", () => {
  it("deletes existing bookmark and returns 200", async () => {
    const bm = await Bookmark.create({ url: "https://delete-me.com", title: "Delete Me" });
    const res = await request(app).delete(`/api/bookmarks/${bm._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const still = await Bookmark.findById(bm._id);
    expect(still).toBeNull();
  });

  it("returns 404 for non-existent ObjectId", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/bookmarks/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it("returns 400 for malformed ID", async () => {
    const res = await request(app).delete("/api/bookmarks/not-an-id");
    expect(res.status).toBe(400);
  });
});

// ── PUT /api/bookmarks/:id ────────────────────────────────────────────────────
describe("PUT /api/bookmarks/:id", () => {
  it("updates title and returns 200 with updated data", async () => {
    const bm = await Bookmark.create({ url: "https://update-me.com", title: "Old Title" });
    const res = await request(app)
      .put(`/api/bookmarks/${bm._id}`)
      .send({ title: "New Title" });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("New Title");
  });

  it("returns 404 for non-existent bookmark", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/bookmarks/${fakeId}`).send({ title: "X" });
    expect(res.status).toBe(404);
  });
});