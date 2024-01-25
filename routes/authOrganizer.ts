import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authOrganizersRouter = express.Router();
const prisma = new PrismaClient();

/**
 * Route for handling organizer login.
 * @route POST /login
 * @param {string} loginEmail - The email of the organizer.
 * @param {string} password - The password of the organizer.
 * @returns {object} - The token for successful login.
 * @throws {object} - Error object if login fails.
 */
authOrganizersRouter.post("/login", async (req, res, next) => {
    const { loginEmail, password } = req.body;
    try {
        const user = await prisma.organizers.findUnique({
            where: {
                email: loginEmail,
            },
        });

        if (!user) {
            return res.status(400).send({ error: "Invalid email or password" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, isOrganizer:true, email: user.email, name:user.name }, process.env.JWT_SECRET as string, {
            expiresIn: "1d",
        });
        res.send({ token });
    } catch (err) {
        next(err);
    }
});

/**
 * Route for handling organizer registration.
 * @route POST /register
 * @param {object} userData - The data of the organizer to be registered.
 * @returns {object} - The created user object.
 * @throws {object} - Error object if registration fails.
 */
authOrganizersRouter.post("/register", async (req, res, next) => {
    const userData = req.body;
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    userData.password = hashedPassword;
    try {
        const createdUser = await prisma.organizers.create({
            data: userData,
        });
        res.send(createdUser);
    } catch (err) {
        next(err);
    }
});

/**
 * Route for handling organizer logout.
 * @route POST /logout
 * @returns {object} - The success message for logout.
 * @throws {object} - Error object if logout fails.
 */
authOrganizersRouter.post("/logout", async (req, res, next) => {
    try {
        // On the client side, remove the token from storage
        res.send({ message: "Logout successful" });
    } catch (err) {
        next(err);
    }
});

export default authOrganizersRouter;