// seed/seed.js
import {
  initDb,
  usersDb,
  coursesDb,
  sessionsDb,
  bookingsDb,
} from "../models/_db.js";
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { UserModel } from "../models/userModel.js";

const iso = (d) => new Date(d).toISOString();

async function wipeAll() {
  // Remove all documents to guarantee a clean seed
  await Promise.all([
    usersDb.remove({}, { multi: true }),
    coursesDb.remove({}, { multi: true }),
    sessionsDb.remove({}, { multi: true }),
    bookingsDb.remove({}, { multi: true }),
  ]);
  // Compact files so you’re not looking at stale data on disk
  await Promise.all([
    usersDb.persistence.compactDatafile(),
    coursesDb.persistence.compactDatafile(),
    sessionsDb.persistence.compactDatafile(),
    bookingsDb.persistence.compactDatafile(),
  ]);
}

async function ensureDemoStudent() {
  let student = await UserModel.lookupByEmail("fiona@student.local");
  if (!student) {
    student = await UserModel.create({
      name: "Fiona",
      email: "fiona@student.local",
      role: "student",
    });
  }
  return student;
}

async function createWeekendWorkshop() {
  const instructor = await UserModel.create({
    name: "Ava",
    email: "ava@yoga.local",
    role: "instructor",
  });
  const course = await CourseModel.create({
    title: "Winter Mindfulness Workshop",
    level: "beginner",
    type: "WEEKEND_WORKSHOP",
    allowDropIn: false,
    startDate: "2026-01-10",
    endDate: "2026-01-11",
    instructorId: instructor._id,
    sessionIds: [],
      description: "Two days of breath, posture alignment, and meditation.",
      sessionPrice: 12,
      coursePrice: 100,
      location: "Glasgow",
  });

  const base = new Date("2026-01-10T09:00:00"); // Sat 9am
  const sessions = [];
  for (let i = 0; i < 5; i++) {
    const start = new Date(base.getTime() + i * 2 * 60 * 60 * 1000); // every 2 hours
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const s = await SessionModel.create({
      courseId: course._id,
      startDateTime: iso(start),
      endDateTime: iso(end),
      capacity: 20,
      bookedCount: 0,
    });
    sessions.push(s);
  }
  await CourseModel.update(course._id, {
    sessionIds: sessions.map((s) => s._id),
  });
  return { course, sessions, instructor };
}

async function createWeeklyBlock() {
  const instructor = await UserModel.create({
    name: "Ben",
    email: "ben@yoga.local",
    role: "instructor",
  });
  const course = await CourseModel.create({
    title: "12‑Week Vinyasa Flow",
    level: "intermediate",
    type: "WEEKLY_BLOCK",
    allowDropIn: true,
    startDate: "2026-02-02",
    endDate: "2026-04-20",
    instructorId: instructor._id,
    sessionIds: [],
      description: "Progressive sequences building strength and flexibility.",
      sessionPrice: 12,
      coursePrice: 100,
      location: "Glasgow",
  });

  const first = new Date("2026-02-02T18:30:00"); // Monday 6:30pm
  const sessions = [];
  for (let i = 0; i < 12; i++) {
    const start = new Date(first.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 75 * 60 * 1000);
    const s = await SessionModel.create({
      courseId: course._id,
      startDateTime: iso(start),
      endDateTime: iso(end),
      capacity: 18,
      bookedCount: 0,
    });
    sessions.push(s);
  }
  await CourseModel.update(course._id, {
    sessionIds: sessions.map((s) => s._id),
  });
  return { course, sessions, instructor };
}

async function verifyAndReport() {
  const [users, courses, sessions, bookings] = await Promise.all([
    usersDb.count({}),
    coursesDb.count({}),
    sessionsDb.count({}),
    bookingsDb.count({}),
  ]);
  console.log("— Verification —");
  console.log("Users   :", users);
  console.log("Courses :", courses);
  console.log("Sessions:", sessions);
  console.log("Bookings:", bookings);
  if (courses === 0 || sessions === 0) {
    throw new Error("Seed finished but no courses/sessions were created.");
  }
}

//additional ai generated courses for placeholders
async function createBeginnerMorningFlow() {
    const instructor = await UserModel.create({
        name: "Mia",
        email: "mia@yoga.local",
        role: "instructor",
    });

    const course = await CourseModel.create({
        title: "Beginner Morning Flow",
        level: "beginner",
        type: "WEEKLY_BLOCK",
        allowDropIn: true,
        startDate: "2026-03-03",
        endDate: "2026-04-21",
        instructorId: instructor._id,
        sessionIds: [],
        description: "Gentle early sessions focused on flexibility and breathing.",
        sessionPrice: 12,
        coursePrice: 100,
        location: "Glasgow",
    });

    const first = new Date("2026-03-03T07:30:00");
    const sessions = [];

    for (let i = 0; i < 8; i++) {
        const start = new Date(first.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const s = await SessionModel.create({
            courseId: course._id,
            startDateTime: iso(start),
            endDateTime: iso(end),
            capacity: 15,
            bookedCount: 0,
        });

        sessions.push(s);
    }

    await CourseModel.update(course._id, {
        sessionIds: sessions.map((s) => s._id),
    });

    return { course, sessions, instructor };
}

async function createPowerYogaSeries() {
    const instructor = await UserModel.create({
        name: "Leo",
        email: "leo@yoga.local",
        role: "instructor",
    });

    const course = await CourseModel.create({
        title: "Power Yoga Strength Series",
        level: "advanced",
        type: "WEEKLY_BLOCK",
        allowDropIn: false,
        startDate: "2026-03-05",
        endDate: "2026-05-28",
        instructorId: instructor._id,
        sessionIds: [],
        description: "High-energy sessions designed for strength and stamina.",
        sessionPrice: 12,
        coursePrice: 100,
        location: "Glasgow",
    });

    const first = new Date("2026-03-05T19:00:00");
    const sessions = [];

    for (let i = 0; i < 12; i++) {
        const start = new Date(first.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 75 * 60 * 1000);

        const s = await SessionModel.create({
            courseId: course._id,
            startDateTime: iso(start),
            endDateTime: iso(end),
            capacity: 20,
            bookedCount: 0,
        });

        sessions.push(s);
    }

    await CourseModel.update(course._id, {
        sessionIds: sessions.map((s) => s._id),
    });

    return { course, sessions, instructor };
}

async function createWeekendRestoreRetreat() {
    const instructor = await UserModel.create({
        name: "Sophie",
        email: "sophie@yoga.local",
        role: "instructor",
    });

    const course = await CourseModel.create({
        title: "Weekend Restore Retreat",
        level: "intermediate",
        type: "WEEKEND_WORKSHOP",
        allowDropIn: false,
        startDate: "2026-05-16",
        endDate: "2026-05-17",
        instructorId: instructor._id,
        sessionIds: [],
        description: "Slow-paced restorative weekend with mindfulness practice.",
        sessionPrice: 12,
        coursePrice: 100,
        location: "Glasgow",
    });

    const base = new Date("2026-05-16T10:00:00");
    const sessions = [];

    for (let i = 0; i < 4; i++) {
        const start = new Date(base.getTime() + i * 3 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 90 * 60 * 1000);

        const s = await SessionModel.create({
            courseId: course._id,
            startDateTime: iso(start),
            endDateTime: iso(end),
            capacity: 16,
            bookedCount: 0,
        });

        sessions.push(s);
    }

    await CourseModel.update(course._id, {
        sessionIds: sessions.map((s) => s._id),
    });

    return { course, sessions, instructor };
}

async function createLunchBreakYoga() {
    const instructor = await UserModel.create({
        name: "Ella",
        email: "ella@yoga.local",
        role: "instructor",
    });

    const course = await CourseModel.create({
        title: "Lunch Break Yoga",
        level: "beginner",
        type: "WEEKLY_BLOCK",
        allowDropIn: true,
        startDate: "2026-03-04",
        endDate: "2026-04-29",
        instructorId: instructor._id,
        sessionIds: [],
        description: "Short midday sessions perfect for office workers.",
        sessionPrice: 12,
        coursePrice: 100,
        location: "Glasgow",
    });

    const first = new Date("2026-03-04T12:15:00");
    const sessions = [];

    for (let i = 0; i < 8; i++) {
        const start = new Date(first.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 45 * 60 * 1000);

        const s = await SessionModel.create({
            courseId: course._id,
            startDateTime: iso(start),
            endDateTime: iso(end),
            capacity: 14,
            bookedCount: 0,
        });

        sessions.push(s);
    }

    await CourseModel.update(course._id, {
        sessionIds: sessions.map((s) => s._id),
    });

    return { course, sessions, instructor };
}

async function run() {
  console.log("Initializing DB…");
  await initDb();

  console.log("Wiping existing data…");
  await wipeAll();

  console.log("Creating demo student…");
  const student = await ensureDemoStudent();

  console.log("Creating weekend workshop…");
  const w = await createWeekendWorkshop();

  console.log("Creating weekly block…");
  const b = await createWeeklyBlock();

  console.log("Creating Beginner Morning Flow…");
  const c = await createBeginnerMorningFlow();

  console.log("Creating PowerYogaSeries…");
  const d = await createPowerYogaSeries();

  console.log("Creating Weekend Restore Retreat…");
  const e = await createWeekendRestoreRetreat();

  console.log("Creating Lunch Break Yoga…");
  const f = await createLunchBreakYoga();

  await verifyAndReport();

  console.log("\n✅ Seed complete.");
  console.log("Student ID           :", student._id);
  console.log(
    "Workshop course ID   :",
    w.course._id,
    "(sessions:",
    w.sessions.length + ")"
  );
  console.log(
    "Weekly block course ID:",
    b.course._id,
    "(sessions:",
    b.sessions.length + ")"
  );
}

run().catch((err) => {
  console.error("❌ Seed failed:", err?.stack || err);
  process.exit(1);
});
