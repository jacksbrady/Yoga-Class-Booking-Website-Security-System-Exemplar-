import bcrypt from "bcrypt";
import { UserModel } from "../models/userModel.js";
import jwt from "jsonwebtoken";

// authenticate user with jwt cookies
export const login = async (req, res, next) => {
    try {
        const email = req.body?.email;
        const password = req.body?.password;

        // required data fulfilled validation
        if (!email || !password) {
            return res.status(400).render("login", {
                title: "Login",
                error: "Email and password are required",
            });
        };

        // Look up the user by email address.
        const user = await UserModel.lookupByEmail(email);

        // render register page if user is not found
        if (!user) {
            console.log("User", email, "not found");
            return res.render("register");
        }

        if (typeof user.password !== "string") {
            console.warn(`Malformed user record for ${email}:`, user);
            return res.status(500).render("error", {
                title: "Server Error",
                message: "User account is not configured correctly",
            });
        }

        // compate password with hashed password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(403).render("login", {
                title: "Login",
                error: "Invalid credentials",
            });
        }

        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            console.error("ACCESS_TOKEN_SECRET is not set");
            return res.status(500).send("Server misconfiguration");
        }

        const payload = {
            _id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        const accessToken = jwt.sign(payload, secret, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        });

        // storing jwt  so routes can verify
        res.cookie("jwt", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: Number(process.env.COOKIE_MAX_AGE)
        });

        req.user = user;
        return next();
        

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).send("Internal Server Error");
    }
};

//ensures login before registered access
export const verify = (req, res, next) => {
    const accessToken = req.cookies?.jwt;

    if (!accessToken) {
        return res.status(401).render("login", {
            title: "Login",
            error: "Please sign in first",
        });
    }

    try {
        const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = payload;

        req.user = payload;
        res.locals.user = payload;
        res.locals.isOrganiser = false;
        return next();
    } catch (e) {
        return res.status(401).render("login", {
            title: "Login",
            error: "Please sign in again",
        });
    }
};


export const checkUser = (req, res, next) => {
    const token = req.cookies?.jwt;

    if (!token) {
        res.locals.user = null;
        return next();
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        req.user = payload;
        res.locals.user = payload;
        res.locals.isOrganiser = payload.role === "organiser";
    } catch (err) {
        res.clearCookie("jwt");
        res.locals.user = null;
        res.locals.isOrganiser = payload.role === "organiser";
    }

    next();

    
};

//ensures organiser is logged in for restricted routes
export const requireOrganiser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).render("login", {
            title: "Login",
            error: "Please sign in first",
        });
    }

    if (req.user.role !== "organiser") {
        return res.status(403).render("error", {
            title: "Access Denied",
            message: "Organiser access is required to view this page.",
        });
    }

    return next();
};