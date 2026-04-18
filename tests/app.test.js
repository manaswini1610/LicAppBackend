import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("GET / returns health payload", async () => {
  const response = await request(app).get("/");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, "Insurance policy API is running");
});

test("GET unknown route returns route not found error", async () => {
  const response = await request(app).get("/unknown-route");

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.errorCode, "ROUTE_NOT_FOUND");
});

test("POST /api/followups validates request body details", async () => {
  const response = await request(app).post("/api/followups").send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.errorCode, "VALIDATION_ERROR");
  assert.equal(Array.isArray(response.body.details), true);
  assert.ok(response.body.details.length > 0);
});
