// controllers/organiserController.js

import { BookingModel } from "../models/bookingModel.js";
import { UserModel } from "../models/userModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { CourseModel } from "../models/courseModel.js";

// -----Course Creation-----

// render new course form
export const show_new_course_form = (req, res) => {
    res.render("course_new", {
        title: "Add New Course",
        user: req.user,
    });
};

// create new course
export const post_new_course = async (req, res, next) => {
    try {
        const {
            title,
            description,
            level,
            type,
            allowDropIn,
            startDate,
            endDate,
        } = req.body;

        // required data fulfilled validation
        if (!title || !level || !type) {
            return res.status(400).render("course_new", {
                title: "Add New Course",
                user: req.user,
                error: "Title, level and type are required.",
            });
        }

        const course = await CourseModel.create({
            title,
            description,
            level,
            type,
            allowDropIn: allowDropIn === "on",
            startDate,
            endDate,
            sessionIds: [],
        });

        return res.redirect(`/courses/${course._id}`);
    } catch (err) {
        console.error("Error creating course:", err);
        return next(err);
    }
};

// -----Course Editing-----

// render edit course form
export const show_edit_course_form = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await CourseModel.findById(courseId);

        if (!course) {
            return res.status(404).render("error", {
                title: "Not Found",
                message: "Course not found",
            });
        }

        const sessions = await SessionModel.listByCourse(courseId);

        const sessionRows = sessions.map((s) => ({
            id: s._id,
            startDateTime: s.startDateTime ? s.startDateTime.slice(0, 16) : "",
            endDateTime: s.endDateTime ? s.endDateTime.slice(0, 16) : "",
            capacity: s.capacity,
            bookedCount: s.bookedCount ?? 0,
        }));

        return res.render("course_edit", {
            title: "Edit Course",
            user: req.user,
            course: {
                id: course._id,
                title: course.title,
                description: course.description || "",
                level: course.level || "",
                type: course.type || "",
                allowDropIn: course.allowDropIn,
                startDate: course.startDate ? course.startDate.slice(0, 10) : "",
                endDate: course.endDate ? course.endDate.slice(0, 10) : "",
            },
            sessions: sessionRows,
        });
    } catch (err) {
        next(err);
    }
};

// fulfill edit in the database
export const post_edit_course = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const {
            title,
            description,
            level,
            type,
            allowDropIn,
            startDate,
            endDate,
        } = req.body;

        // required data fulfilled validation
        if (!title || !level || !type) {
            return res.status(400).render("error", {
                title: "Invalid course",
                message: "Title, level and type are required.",
            });
        }

        await CourseModel.update(courseId, {
            title,
            description: description || "",
            level,
            type,
            allowDropIn: allowDropIn === "on",
            startDate: startDate || null,
            endDate: endDate || null,
        });

        return res.redirect(`/organiser/courses/${courseId}/edit`);
    } catch (err) {
        next(err);
    }
};

// delete course
export const delete_course = async (req, res, next) => {
    try {
        const courseId = req.params.id;

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).render("error", {
                title: "Not Found",
                message: "Course not found",
            });
        }

        const sessions = await SessionModel.listByCourse(courseId);

        for (const session of sessions) {
            await SessionModel.delete(session._id);
        }

        await CourseModel.delete(courseId);

        return res.redirect("/courses");
    } catch (err) {
        next(err);
    }
};


// ---Session Editor

// render add new session form
export const show_new_session_form = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await CourseModel.findById(courseId);

        if (!course) {
            return res.status(404).render("error", {
                title: "Not Found",
                message: "Course not found",
            });
        }

        res.render("session_new", {
            title: "Add New Class",
            user: req.user,
            course: {
                id: course._id,
                title: course.title,
            },
        });
    } catch (err) {
        next(err);
    }
};

// add session to course
export const post_new_session = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const { startDateTime, endDateTime, capacity } = req.body;

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return res.status(404).render("error", {
                title: "Not Found",
                message: "Course not found",
            });
        }

        // required data fulfilled validation
        if (!startDateTime || !endDateTime || !capacity) {
            return res.status(400).render("session_new", {
                title: "Add New Class",
                user: req.user,
                error: "Start time, end time and capacity are required.",
                course: {
                    id: course._id,
                    title: course.title,
                },
            });
        }

        const session = await SessionModel.create({
            courseId,
            startDateTime: new Date(startDateTime).toISOString(),
            endDateTime: new Date(endDateTime).toISOString(),
            capacity: Number(capacity),
            bookedCount: 0,
        });

        const updatedSessionIds = [...(course.sessionIds || []), session._id];
        await CourseModel.update(courseId, { sessionIds: updatedSessionIds });

        return res.redirect(`/organiser/courses/${courseId}/edit`);
    } catch (err) {
        next(err);
    }
};

// delete session (including id from course)
export const delete_session = async (req, res, next) => {
    try {
        const { courseId, sessionId } = req.params;

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).render("error", {
                title: "Not Found",
                message: "Course not found",
            });
        }

        await SessionModel.delete(sessionId);

        const updatedSessionIds = (course.sessionIds || []).filter(
            (id) => id !== sessionId
        );

        await CourseModel.update(courseId, {
            sessionIds: updatedSessionIds,
        });

        return res.redirect(`/organiser/courses/${courseId}/edit`);
    } catch (err) {
        next(err);
    }
};

// -----Booking Management-----

//list by session
export const get_session_participants_json = async (req, res, next) => {
    try {
        const sessionId = req.params.id;

        const bookings = await BookingModel.listBySession(sessionId);

        const activeBookings = bookings.filter(
            (booking) => booking.status !== "CANCELLED"
        );

        const participants = await Promise.all(
            activeBookings.map(async (booking) => {
                const user = await UserModel.lookupById(booking.userId);

                return {
                    bookingId: booking._id,
                    name: user?.name || "Unknown user",
                    email: user?.email || "",
                };
            })
        );

        return res.json({ participants });
    } catch (err) {
        next(err);
    }
};

//remover user from session
export const remove_booking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await BookingModel.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.status === "CANCELLED") {
            return res.json({ booking });
        }

        if (booking.status === "CONFIRMED") {
            for (const sid of booking.sessionIds || []) {
                await SessionModel.incrementBookedCount(sid, -1);
            }
        }

        const updated = await BookingModel.cancel(bookingId);
        return res.json({ booking: updated });
    } catch (err) {
        next(err);
    }
};

// -----Manage Users-----

// render user management page
export const show_manage_users = async (req, res, next) => {
    try {
        const users = await UserModel.list();

        const rows = users.map((user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "student",
            isCurrentUser: user._id === req.user._id,
            isStudent: (user.role || "student") === "student",
            isInstructor: user.role === "instructor",
            isOrganiser: user.role === "organiser",
        }));

        return res.render("manage_users", {
            title: "Manage Users",
            user: req.user,
            users: rows,
        });
    } catch (err) {
        next(err);
    }
};

// user role updates
export const update_user_role = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        if (!["student", "instructor", "organiser"].includes(role)) {
            return res.status(400).render("error", {
                title: "Invalid Role",
                message: "Role must be student, instructor, or organiser.",
            });
        }

        await UserModel.update(userId, { role });

        return res.redirect("/organiser/users");
    } catch (err) {
        next(err);
    }
};

// delete accounts
export const delete_user = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (userId === req.user._id) {
            return res.status(400).render("error", {
                title: "Invalid Action",
                message: "You cannot delete your own account while logged in.",
            });
        }

        await UserModel.delete(userId);

        return res.redirect("/organiser/users");
    } catch (err) {
        next(err);
    }
};