// controllers/authController.js

import { UserModel } from "../models/userModel.js";

// render login page
export const show_login = (req, res) => {
    res.render("login", { title: "Login" });
};

// redirect after middleware authentication
export const handle_login = (req, res) => {
    res.redirect("/");
};

// render regustration page
export const show_register = (req, res) => {
    res.render("register", { title: "User Registration" });
};

// clear autehntication cookie and redirect to home page
export const logout = (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
}

// creating new users
export const post_new_user = async (req, res, next) => {
    const name = req.body?.name;
    const email = req.body?.email;
    const password = req.body?.password;
    const role = req.body?.role || "student";

    // ensuring all required fields are filled
    if (!name || !email || !password) {
        return res.status(400).render("register", {
            title: "User Registration",
            error: "Name, email and password are required",
        });
    }

    // duplicate account prevention
    try {
        const existingUser = await UserModel.lookupByEmail(email);

        if (existingUser) {
            return res.status(409).render("register", {
                title: "User Registration",
                error: `User already exists: ${email}`,
            });
        }

        // add new user to database
        await UserModel.create({
            name,
            email,
            password,
            role,
        });

        console.log("Registered user:", email);
        return res.redirect("/login");
    } catch (err) {
        console.error("Error creating user:", err);
        return res.status(500).send("Internal Server Error");
    }
};


