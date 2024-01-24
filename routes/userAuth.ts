import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userAuthRouter = express.Router();
const prisma = new PrismaClient();

userAuthRouter.post('/login', async (req, res, next) => {
    const {tempEmail, password} = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: {
                email: tempEmail,
            },
        });
        if (!user) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }
        const userJWT = { id: user.id, name:user.fName, email:user.email, roleId: "1" };
        const token = jwt.sign({"userJWT": userJWT}, process.env.JWT_SECRET as string, {expiresIn: '1d'});
        res.send({token});
    } catch (err) {
        next(err);
    }
});

userAuthRouter.post('/register', async (req, res, next) => {
    const userData = req.body;
    let tempfName = userData.fName ?? '';
    let tempEmail = userData.email ?? '';
    let referralCode = '';
    if (tempfName && tempEmail) {
        referralCode = Buffer.from(tempfName + tempEmail).toString('base64');
    }
    userData.referralCode = referralCode;
    try {
        const createdUser = await prisma.users.create({
            data: userData,
        });
        res.send(createdUser);
    } catch (err) {
        next(err);
    }
});

userAuthRouter.post('/logout', async (req, res, next) => {
    try {
        // On the client side, remove the token from storage
        res.send({ message: 'Logout successful' });
    } catch (err) {
        next(err);
    }
});

export default userAuthRouter;