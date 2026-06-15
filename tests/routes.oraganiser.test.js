import request from "supertest";
import { app } from "../index.js";
import { resetDb, seedMinimal } from "./helpers.js";
import { UserModel } from "../models/userModel.js";
import { BookingModel } from "../models/bookingModel.js";
import { SessionModel } from "../models/sessionModel.js";

describe("Organiser routes", () => {
    let data;
    let organiser;
    let agent;

    beforeAll(async () => {
        await resetDb();
        data = await seedMinimal();

        organiser = await UserModel.create({
            name: "Test Organiser",
            email: "organiser@test.local",
            password: "password123",
            role: "organiser",
        });

        agent = request.agent(app);

        const loginRes = await agent.post("/login").send({
            email: "organiser@test.local",
            password: "password123",
        });

        expect([200, 302]).toContain(loginRes.status);
    });

    describe("page rendering", () => {
        test("GET /organiser/users renders manage users page", async () => {
            const res = await agent.get("/organiser/users");

            expect(res.status).toBe(200);
            expect(res.headers["content-type"]).toMatch(/html/i);
            expect(res.text).toMatch(/Manage Users/i);
            expect(res.text).toMatch(/Test Organiser/);
        });

        test("GET /organiser/courses/new renders new course form", async () => {
            const res = await agent.get("/organiser/courses/new");

            expect(res.status).toBe(200);
            expect(res.headers["content-type"]).toMatch(/html/i);
            expect(res.text).toMatch(/Add New Course/i);
            expect(res.text).toMatch(/Course Title/i);
        });

        test("GET /organiser/courses/:id/edit renders course edit page", async () => {
            const res = await agent.get(`/organiser/courses/${data.course._id}/edit`);

            expect(res.status).toBe(200);
            expect(res.headers["content-type"]).toMatch(/html/i);
            expect(res.text).toMatch(/Edit Course/i);
            expect(res.text).toMatch(/Test Course/);
            expect(res.text).toMatch(/Classes \/ Sessions/i);
        });

        test("GET /organiser/courses/:id/sessions/new renders add session form", async () => {
            const res = await agent.get(
                `/organiser/courses/${data.course._id}/sessions/new`
            );

            expect(res.status).toBe(200);
            expect(res.headers["content-type"]).toMatch(/html/i);
            expect(res.text).toMatch(/Add New Class/i);
            expect(res.text).toMatch(/Start Date and Time/i);
        });
    });

    describe("user management", () => {
        test("POST /organiser/users/:id/role updates a user role", async () => {
            const res = await agent
                .post(`/organiser/users/${data.student._id}/role`)
                .send({ role: "instructor" });

            expect(res.status).toBe(302);

            const updated = await UserModel.lookupById(data.student._id);
            expect(updated.role).toBe("instructor");
        });
    });

    describe("participants and booking removal", () => {
        let booking;

        beforeAll(async () => {
            booking = await BookingModel.create({
                userId: data.student._id,
                courseId: data.course._id,
                type: "SESSION",
                sessionIds: [data.sessions[0]._id],
                status: "CONFIRMED",
            });

            await SessionModel.incrementBookedCount(data.sessions[0]._id, 1);
        });

        test("GET /organiser/sessions/:id/participants returns participant JSON", async () => {
            const res = await agent.get(
                `/organiser/sessions/${data.sessions[0]._id}/participants`
            );

            expect(res.status).toBe(200);
            expect(res.headers["content-type"]).toMatch(/json/i);
            expect(Array.isArray(res.body.participants)).toBe(true);
            expect(
                res.body.participants.some((p) => p.email === data.student.email)
            ).toBe(true);
        });

        test("POST /organiser/bookings/:bookingId/remove cancels a booking", async () => {
            const res = await agent.post(`/organiser/bookings/${booking._id}/remove`);

            expect(res.status).toBe(200);
            expect(res.headers["content-type"]).toMatch(/json/i);
            expect(res.body.booking.status).toBe("CANCELLED");
        });

        test("GET /organiser/sessions/:id/participants excludes cancelled bookings", async () => {
            const res = await agent.get(
                `/organiser/sessions/${data.sessions[0]._id}/participants`
            );

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.participants)).toBe(true);
            expect(
                res.body.participants.some((p) => p.bookingId === booking._id)
            ).toBe(false);
        });
    });
});