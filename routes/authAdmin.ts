import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./lib/authenticateJWT";

const authAdminRouter = express.Router();
const prisma = new PrismaClient();

/**
 * Route for admin login.
 * @route POST /login
 * @param {string} loginEmail - The email address of the admin user.
 * @param {string} password - The password of the admin user.
 * @returns {object} - The JWT token for authentication.
 */
authAdminRouter.post("/login", async (req, res, next) => {
    const { loginEmail, password } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: {
                email: loginEmail,
            },
            include: {
                roles: {
                    select:{
                        roleId: true
                    }
                },
            }
        });

        if (!user || !user.roles.some(role => role.roleId === 2)) {
            return res.status(400).send({ error: "Invalid email or password" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, roleId: "2" }, process.env.JWT_SECRET as string, {
            expiresIn: "1d",
        });
        res.send({ token });
    } catch (err) {
        next(err);
    }
});

/**
 * Route for creating a new admin user.
 * @route POST /create/admin
 * @param {object} userData - The data of the admin user to be created.
 * @returns {object} - The created admin user and its role.
 */
authAdminRouter.post("/create/admin", authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const userData = req.body;
    let tempfName = userData.fName ?? "";
    let loginEmail = userData.email ?? "";
    let referralCode = "";
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    userData.password = hashedPassword;
    if (tempfName && loginEmail) {
        referralCode = Buffer.from(tempfName + loginEmail).toString("base64");
    }
    userData.referralCode = referralCode;
    try {
        const createdUser = await prisma.users.create({
            data: userData,
        });
        const createdUserRole = await prisma.usersRoles.create({
            data: {
                userId: createdUser.id,
                roleId: 2,
            },
        });
        res.send({createdUser, createdUserRole});
    } catch (err) {
        next(err);
    }
});

/**
 * Route for admin logout.
 * @route POST /logout
 * @returns {object} - A message indicating successful logout.
 */
authAdminRouter.post("/logout", async (req, res, next) => {
    try {
        // On the client side, remove the token from storage
        res.send({ message: "Logout successful" });
    } catch (err) {
        next(err);
    }
});

export default authAdminRouter;