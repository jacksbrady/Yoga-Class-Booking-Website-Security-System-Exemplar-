// routes/views.js
import { Router } from "express";
import {
    homePage,
    courseDetailPage,
    postBookCourse,
    postBookSession,
    bookingConfirmationPage,
} from "../controllers/viewsController.js";

import {
    show_login,
    handle_login,
    show_register,
    post_new_user,
    logout,
} from "../controllers/authController.js";

import { login, verify, requireOrganiser } from "../middlewares/auth.js";
import { coursesListPage } from "../controllers/coursesListController.js";

import {
    show_new_course_form,
    post_new_course,
    show_edit_course_form,
    post_edit_course,
    show_new_session_form,
    post_new_session,
    delete_session,
    get_session_participants_json,
    delete_course,
    show_manage_users,
    update_user_role,
    delete_user,
    remove_booking,
} from "../controllers/organiserController.js";

const router = Router();

// -----Main Page Routes-----

router.get("/", homePage);
router.get("/courses", coursesListPage);
router.get("/courses/:id", courseDetailPage);

// -----Booking Routes-----

router.post("/courses/:id/book", verify, postBookCourse);
router.post("/sessions/:id/book", verify, postBookSession);
router.get("/bookings/:bookingId", bookingConfirmationPage);

// -----Course Edit Routes-----

router.get(
    "/organiser/courses/new",
    verify,
    requireOrganiser,
    show_new_course_form
);

router.post(
    "/organiser/courses/new",
    verify,
    requireOrganiser,
    post_new_course
);

router.get(
    "/organiser/courses/:id/edit",
    verify,
    requireOrganiser,
    show_edit_course_form
);

router.post(
    "/organiser/courses/:id/edit",
    verify,
    requireOrganiser,
    post_edit_course
);

// -----Session Edit Routes-----

router.get(
    "/organiser/courses/:id/sessions/new",
    verify,
    requireOrganiser,
    show_new_session_form
);

router.post(
    "/organiser/courses/:id/sessions/new",
    verify,
    requireOrganiser,
    post_new_session
);

router.post(
    "/organiser/courses/:courseId/sessions/:sessionId/delete",
    verify,
    requireOrganiser,
    delete_session
);

router.get(
    "/organiser/sessions/:id/participants",
    verify,
    requireOrganiser,
    get_session_participants_json
);

router.post(
    "/organiser/bookings/:bookingId/remove",
    verify,
    requireOrganiser,
    remove_booking
);

router.post(
    "/organiser/courses/:id/delete",
    verify,
    requireOrganiser,
    delete_course
);

// -----User Management Routes-----

router.get(
    "/organiser/users",
    verify,
    requireOrganiser,
    show_manage_users
);

router.post(
    "/organiser/users/:id/role",
    verify,
    requireOrganiser,
    update_user_role
);

router.post(
    "/organiser/users/:id/delete",
    verify,
    requireOrganiser,
    delete_user
);

// -----Authentication Routes-----

router.get("/login", show_login);
router.post("/login", login, handle_login);

router.get("/register", show_register);
router.post("/register", post_new_user);

router.get("/logout", logout);

export default router;