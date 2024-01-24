import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticateToken } from './lib/authenticateJWT';

const userRouter = express.Router();
const prisma = new PrismaClient();

userRouter.get('/', authenticateToken, async (req, res, next) => {
    console.log(req.user);
    if (req.user.roleId === "2") {
        try {
            const users = await prisma.users.findMany();
            res.send(users);
        } catch (err) {
            next(err);
        }
    } else {
        res.status(401).send({ error: 'Unauthorized' });
    }
});

userRouter.get('/:id', authenticateToken, async (req, res, next) => {
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

userRouter.post('/', async (req, res, next) => {
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

userRouter.post('/admin/', async (req, res, next) => {
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
        const createdUsersRolesAdmin = await prisma.usersRoles.create({
            data: {
                userId: createdUser.id,
                roleId: 2,
            },
        });
        res.send(createdUser);
    } catch (err) {
        next(err);
    }
});

userRouter.post('/createTest', async (req, res, next) => {
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

userRouter.put('/:id', authenticateToken, async (req, res, next) => {
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

userRouter.delete('/:id', authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== "2") {
        return res.status(401).send({ error: 'Unauthorized' });
    } else {

        const userId = Number(req.params.id);
        try {
            const deletedUser = await prisma.users.delete({
                where: {
                    id: userId,
                },
            });
            res.send(deletedUser);
        } catch (err) {
            next(err);
        }
    }
});

export default userRouter