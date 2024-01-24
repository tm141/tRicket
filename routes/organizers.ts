import express from "express";
import { PrismaClient } from "@prisma/client";
import { expressjwt } from "express-jwt";
import guard from 'express-jwt-permissions';
import { authenticateToken } from "./lib/authenticateJWT";
// import { checkJwt } from "../middlewares/checkJwt";

const organizerRouter = express.Router();
const prisma = new PrismaClient();


organizerRouter.get("/", authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        res.status(401).send({ error: "Unauthorized" });
    } else {
        try {
            const organizers = await prisma.organizers.findMany();
            res.send(organizers);
        } catch (err) {
            next(err);
        }
    }
});

organizerRouter.get("/:id", authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        res.status(401).send({ error: "Unauthorized" });
    } else {
        const organizerId = Number(req.params.id);
        try {
            const organizer = await prisma.organizers.findUnique({
                where: {
                    id: organizerId,
                },
            });
            if (!organizer) {
                return res.status(404).send({ error: "Organizer not found" });
            }
            res.send(organizer);
        } catch (err) {
            next(err);
        }
    }
});

organizerRouter.post("/", async (req, res, next) => {
    const organizerData = req.body;
    try {
        const createdOrganizer = await prisma.organizers.create({
            data: organizerData,
        });
        res.send(createdOrganizer);
    } catch (err) {
        next(err);
    }
});

organizerRouter.put("/:id", authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        res.status(401).send({ error: "Unauthorized" });
    } else {
        const organizerId = Number(req.params.id);
        const organizerData = req.body;
        try {
            const tempOrganizer = await prisma.organizers.findUnique({
                where: {
                    id: organizerId,
                },
            });
            if (!tempOrganizer) {
                return res.status(404).send({ error: "Organizer not found" });
            }
            const updatedOrganizer = await prisma.organizers.update({
                where: {
                    id: organizerId,
                },
                data: organizerData,
            });
            res.send(updatedOrganizer);
        } catch (err) {
            next(err);
        }
    }
});

organizerRouter.delete("/:id", authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        res.status(401).send({ error: "Unauthorized" });
    } else {
        const organizerId = Number(req.params.id);
        try {
            const deletedOrganizer = await prisma.organizers.delete({
                where: {
                    id: organizerId,
                },
            });
            res.send(deletedOrganizer);
        } catch (err) {
            next(err);
        }
    }
});

export default organizerRouter;