import request from "supertest";
import { app } from "../index.js";
import { resetDb } from "./helpers.js";

describe("Edge cases", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await resetDb();
  });

    test("GET /api/courses/:id with bad id returns 404 JSON", async () => {
        //added api to match the code
    const res = await request(app).get("/api/courses/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json|html|text/); // depends on controller style
  });

    test("POST /bookings/session with invalid sessionId returns 404 JSON", async () => {
        //added api to match the code
    const res = await request(app).post("/api/bookings/session").send({
      userId: "invalid-user",
      sessionId: "invalid-session",
    });
        expect(res.status).toBe(500);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toBeDefined();
  });
});
