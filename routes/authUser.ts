import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userAuthRouter = express.Router();
const prisma = new PrismaClient();

/**
 * Route for user login.
 * @name POST /login
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object containing the JWT token
 */
userAuthRouter.post('/login', async (req, res, next) => {
    const { loginEmail, password } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: {
                email: loginEmail,
            },
        });
        if (!user) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id, name: user.fName, email: user.email, roleId: "1" }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
        res.send({ token });
    } catch (err) {
        next(err);
    }
});

/**
 * Route for user registration.
 * @name POST /register
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object containing the created user data
 */
userAuthRouter.post('/register', async (req, res, next) => {
    const userData = req.body;
    let tempfName = userData.fName ?? '';
    let loginEmail = userData.email ?? '';
    let referralCode = '';

    let userIdRecieverReferralCode = -1;

    let recieverReferralCode = userData.referralCode ?? '';

    try {
        const reciever = await prisma.users.findUnique({
            where: {
                referralCode: recieverReferralCode,
            },
        });
        if (reciever) {
            userIdRecieverReferralCode = reciever.id;
        }
    } catch (err) {
        next(err);
    }

    if (tempfName && loginEmail) {
        referralCode = Buffer.from(tempfName + loginEmail).toString('base64');
    }
    userData.referralCode = referralCode;
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    userData.password = hashedPassword;
    try {
        if (userIdRecieverReferralCode>-1) {
            userData.registerCoupon = true;
            const updateUserPoint = await prisma.users.update({
                where: {
                    id: userIdRecieverReferralCode,
                },
                data: {
                    points: {
                        increment: 10000,
                    },
                },
            });
        }
        
        const createdUser = await prisma.users.create({
            data: userData,
        });
        res.send(createdUser);
    } catch (err) {
        next(err);
    }
});

/**
 * Route for user logout.
 * @route POST /logout
 * @returns {object} - The success message for logout.
 * @throws {object} - Error object if logout fails.
 */
userAuthRouter.post('/logout', async (req, res, next) => {
    try {
        // On the client side, remove the token from storage
        res.send({ message: 'Logout successful' });
    } catch (err) {
        next(err);
    }
});

export default userAuthRouter;