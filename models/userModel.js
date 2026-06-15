// models/userModel.js

import bcrypt from "bcrypt";
//import user databse
import { usersDb } from "./_db.js";

const saltRounds = 10;

// export object being looked for
export const UserModel = {
    async create({ name, email, password, role = "student" }) {
        try {
            const entry = {
                name,
                email,
                role,
            };

            if (password) {
                entry.password = await bcrypt.hash(password, saltRounds);
            }

            const doc = await usersDb.insert(entry);
            return doc;
        } catch (err) {
            console.error(`Error inserting user ${email}:`, err);
            throw err;
        }
    },

    // Lookup user by Email
    async lookupByEmail(email) {
        try {
            return await usersDb.findOne({ email });
        } catch (err) {
            console.error("Error looking up user by email:", err);
            throw err;
        }
    },

    // Lookup user by Email
    async lookupById(id) {
        try {
            return await usersDb.findOne({ _id: id });
        } catch (err) {
            console.error("Error looking up user by id:", err);
            throw err;
        }
    },

    //list users
    async list(filter = {}) {
        try {
            return await usersDb.find(filter);
        } catch (err) {
            console.error("Error listing users:", err);
            throw err;
        }
    },

    // remove account from database
    async delete(id) {
        try {
            return await usersDb.remove({ _id: id }, {});
        } catch (err) {
            console.error("Error deleting user:", err);
            throw err;
        }
    },

    // apply update to user
    async update(id, updates) {
        try {
            return await usersDb.update(
                { _id: id },
                { $set: updates },
                {}
            );
        } catch (err) {
            console.error("Error updating user:", err);
            throw err;
        }
    },

};
