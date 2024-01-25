/**
 * Express router for handling admin organizer routes.
 * @module adminOrganizerRouter
 */

import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./lib/authenticateJWT";
import bcrypt from "bcrypt";

const adminOrganizerRouter = express.Router();
const prisma = new PrismaClient();

/**
 * GET route for retrieving a list of organizers.
 * @name GET /
 * @memberof module:adminOrganizerRouter
 * @param  req.query.name - The name of the organizer (optional).
 * @param  req.query.email - The email of the organizer (optional).
 * @param  req.query.phone - The phone number of the organizer (optional).
 * @param  req.query.address - The address of the organizer (optional).
 * @param  req.query.startDate - The start date of the organizer (optional).
 * @param  req.query.endDate - The end date of the organizer (optional).
 * @param  req.query.page - The page number for pagination (optional, default: 1).
 * @param  req.query.limit - The maximum number of items per page (optional, default: 10).
 * @param  req.query.archived - Whether to include archived organizers (optional).
 * @param  req.user - The authenticated user object.
 * @param  req.user.roleId - The role ID of the authenticated user.
 * @param  res - The response object.
 * @param  next - The next middleware function.
 * @returns promise<void>
 */
adminOrganizerRouter.get("/", authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        res.status(401).send({ error: "Unauthorized" });
    } else {
        const name = req.query.name as string;
        const email = req.query.email as string;
        const phone = req.query.phone as string;
        const address = req.query.address as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        let archived = null;
        try {
            archived = JSON.parse(req.query.archived as string);
        } catch (err) {
            next(err);
        }
        try {
            const organizers = await prisma.organizers.findMany({
                where: {
                    name: {
                        contains: name,
                    },
                    email: {
                        contains: email,
                    },
                    phone: {
                        contains: phone,
                    },
                    address: {
                        contains: address,
                    },
                    archived: archived ?? undefined,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
            });
            res.send(organizers);
        } catch (err) {
            next(err);
        }
    }
});

/**
 * GET route for retrieving a specific organizer.
 * @name GET /:id
 * @function
 * @memberof module:adminOrganizerRouter
 * @param  req.params.id - The ID of the organizer.
 * @param  req.user - The authenticated user object.
 * @param  req.user.roleId - The role ID of the authenticated user.
 * @param  res - The response object.
 * @param  next - The next middleware function.
 * @returns promise<void>
 */
adminOrganizerRouter.get("/:id", authenticateToken, async (req, res, next) => {
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


/**
 * POST route for creating a new organizer.
 * @name POST /create/organizer
 * @function
 * @memberof module:adminOrganizerRouter
 * @param  req.body - The organizer data.
 * @param  req.user - The authenticated user object.
 * @param  req.user.roleId - The role ID of the authenticated user.
 * @param  res - The response object.
 * @param  next - The next middleware function.
 * @returns promise<void>
 */
adminOrganizerRouter.post("/create/organizer", authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        res.status(401).send({ error: "Unauthorized" });
    }
    const organizerData = req.body;
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(organizerData.password, saltRounds);
    organizerData.password = hashedPassword;
    try {
        const createdOrganizer = await prisma.organizers.create({
            data: organizerData,
        });
        res.send(createdOrganizer);
    } catch (err) {
        next(err);
    }
});

/**
 * PUT route for updating an organizer.
 * @name PUT /:id
 * @function
 * @memberof module:adminOrganizerRouter
 * @param  req.params.id - The ID of the organizer.
 * @param  req.body - The updated organizer data.
 * @param  req.user - The authenticated user object.
 * @param  req.user.roleId - The role ID of the authenticated user.
 * @param  res - The response object.
 * @param  next - The next middleware function.
 * @returns promise<void>
 */
adminOrganizerRouter.put("/:id", authenticateToken, async (req, res, next) => {
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

/**
 * DELETE route for archiving an organizer.
 * @name DELETE /:id
 * @function
 * @memberof module:adminOrganizerRouter
 * @param  req.params.id - The ID of the organizer.
 * @param  req.user - The authenticated user object.
 * @param  req.user.roleId - The role ID of the authenticated user.
 * @param  res - The response object.
 * @param  next - The next middleware function.
 * @returns promise<void>
 */
adminOrganizerRouter.delete("/:id", authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        res.status(401).send({ error: "Unauthorized" });
    } else {
        const organizerId = Number(req.params.id);
        try {
            const deletedOrganizer = await prisma.organizers.update({
                where: {
                    id: organizerId,
                },
                data: {
                    archived: true,
                },
            });
            res.send(deletedOrganizer);
        } catch (err) {
            next(err);
        }
    }
});

export default adminOrganizerRouter;