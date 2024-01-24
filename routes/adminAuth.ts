import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminAuthRouter = express.Router();
const prisma = new PrismaClient();

adminAuthRouter.post("/login", async (req, res, next) => {
    const { tempEmail, password } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: {
                email: tempEmail,
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

adminAuthRouter.post("/register", async (req, res, next) => {
    const userData = req.body;
    let tempfName = userData.fName ?? "";
    let tempEmail = userData.email ?? "";
    let referralCode = "";
    if (tempfName && tempEmail) {
        referralCode = Buffer.from(tempfName + tempEmail).toString("base64");
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

adminAuthRouter.post("/logout", async (req, res, next) => {
    try {
        // On the client side, remove the token from storage
        res.send({ message: "Logout successful" });
    } catch (err) {
        next(err);
    }
});

export default adminAuthRouter;