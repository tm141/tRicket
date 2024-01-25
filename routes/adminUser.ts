/**
 * Express router for handling admin user routes.
 * @module adminUserRouter
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticateToken } from './lib/authenticateJWT';

const adminUserRouter = express.Router();
const prisma = new PrismaClient();

/**
 * GET route for retrieving a list of users.
 * @name GET /
 * @function
 * @memberof module:adminUserRouter
 * @param {string} req.query.fName - The first name of the user (optional).
 * @param {string} req.query.lName - The last name of the user (optional).
 * @param {string} req.query.email - The email of the user (optional).
 * @param {string} req.query.phone - The phone number of the user (optional).
 * @param {string} req.query.address - The address of the user (optional).
 * @param {string} req.query.startDate - The start date for filtering user creation date (optional).
 * @param {string} req.query.endDate - The end date for filtering user creation date (optional).
 * @param {number} req.query.page - The page number for pagination (optional, default: 1).
 * @param {number} req.query.limit - The maximum number of users to retrieve per page (optional, default: 10).
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.roleId - The role ID of the authenticated user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} The list of users.
 * @throws {Error} If an error occurs while retrieving the users.
 * @throws {Error} If the user is not authorized.
 */
adminUserRouter.get('/', authenticateToken, async (req, res, next) => {
    console.log(req.user);
    if (req.user.roleId === "2") {
        const fName = req.query.fName as string;
        const lName = req.query.lName as string;
        const email = req.query.email as string;
        const phone = req.query.phone as string;
        const address = req.query.address as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        try {
            const users = await prisma.users.findMany({
                where: {
                    fName: {
                        contains: fName,
                    },
                    lName: {
                        contains: lName,
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
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
            });
            res.send(users);
        } catch (err) {
            next(err);
        }
    } else {
        res.status(401).send({ error: 'Unauthorized' });
    }
});


/**
 * GET route for retrieving a user by ID.
 * @name GET /:id
 * @function
 * @memberof module:adminUserRouter
 * @param {number} req.params.id - The ID of the user.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.roleId - The role ID of the authenticated user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} The user object.
 * @throws {Error} If an error occurs while retrieving the user.
 * @throws {Error} If the user is not authorized.
 */
adminUserRouter.get('/:id', authenticateToken, async (req, res, next) => {
    if (req.user.roleId === "2") {
        const userId = Number(req.params.id);
        try {
            const user = await prisma.users.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }
            res.send(user);
        } catch (err) {
            next(err);
        }
    } else {
        res.status(401).send({ error: 'Unauthorized' });
    }
});

/**
 * POST route for creating a new user.
 * @name POST /create/user
 * @function
 * @memberof module:adminUserRouter
 * @param {Object} req.body - The user data.
 * @param {string} req.body.fName - The first name of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} The created user object.
 * @throws {Error} If an error occurs while creating the user.
 */
adminUserRouter.post('/create/user', async (req, res, next) => {
    const userData = req.body;
    let tempfName = userData.fName ?? '';
    let tempEmail = userData.email ?? '';
    let referralCode = '';
    if (tempfName && tempEmail) {
        referralCode = Buffer.from(tempfName + tempEmail).toString('base64');
    }
    userData.referralCode = referralCode;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    userData.password = hashedPassword;

    try {
        const createdUser = await prisma.users.create({
            data: userData,
        });
        const createdUsersRoles = await prisma.usersRoles.create({
            data: {
                userId: createdUser.id,
                roleId: 1,
            },
        });
        res.send(createdUser);
    } catch (err) {
        next(err);
    }
});


/**
 * PUT route for updating a user by ID.
 * @name PUT /:id
 * @function
 * @memberof module:adminUserRouter
 * @param {number} req.params.id - The ID of the user.
 * @param {Object} req.body - The updated user data.
 * @param {string} req.body.fName - The updated first name of the user (optional).
 * @param {string} req.body.email - The updated email of the user (optional).
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.roleId - The role ID of the authenticated user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} The updated user object.
 * @throws {Error} If an error occurs while updating the user.
 * @throws {Error} If the user is not authorized.
 */
adminUserRouter.put('/:id', authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        return res.status(401).send({ error: 'Unauthorized' });
    } else {
        const userId = Number(req.params.id);
        const userData = req.body;
        try {
            const tempUser = await prisma.users.findUnique({
                where: {
                    id: userId,
                },
            });
            let tempReferralCode = '';
            if (tempUser) {
                let tempfName = userData.fName ?? tempUser.fName;
                let tempEmail = userData.email ?? tempUser.email;
                tempReferralCode = Buffer.from(tempfName + tempEmail).toString('base64');
            }
            userData.referralCode = tempReferralCode;
            const updatedUser = await prisma.users.update({
                where: {
                    id: userId,
                },
                data: userData,
            });
            res.send(updatedUser);
        } catch (err) {
            next(err);
        }
    }
});


/**
 * DELETE route for deleting a user by ID.
 * @name DELETE /:id
 * @function
 * @memberof module:adminUserRouter
 * @param {number} req.params.id - The ID of the user.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.roleId - The role ID of the authenticated user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} The deleted user object.
 * @throws {Error} If an error occurs while deleting the user.
 * @throws {Error} If the user is not authorized.
 */
adminUserRouter.delete('/:id', authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        return res.status(401).send({ error: 'Unauthorized' });
    } else {

        const userId = Number(req.params.id);
        try {
            const deletedUser = await prisma.users.update({
                where: {
                    id: userId,
                },
                data: {
                    archived: true,
                },
            });
            res.send(deletedUser);
        } catch (err) {
            next(err);
        }
    }
});

export default adminUserRouter