import express from 'express';
import { PrismaClient } from '@prisma/client';
import { expressjwt } from 'express-jwt';

const userRolesRouter = express.Router();
const prisma = new PrismaClient();

userRolesRouter.get('/', async (req, res, next) => {
    try {
        const userRoles = await prisma.usersRoles.findMany();
        res.send(userRoles);
    } catch (err) {
        next(err);
    }
});

userRolesRouter.get('/:id', async (req, res, next) => {
    const userRoleId = Number(req.params.id);
    try {
        const userRole = await prisma.usersRoles.findUnique({
            where: {
                id: userRoleId,
            },
        });
        if (!userRole) {
            return res.status(404).send({ error: 'User role not found' });
        }
        res.send(userRole);
    } catch (err) {
        next(err);
    }
});

userRolesRouter.post('/', async (req, res, next) => {
    const userRoleData = req.body;
    try {
        const createdUserRole = await prisma.usersRoles.create({
            data: userRoleData,
        });
        res.send(createdUserRole);
    } catch (err) {
        next(err);
    }
});

userRolesRouter.put('/:id', async (req, res, next) => {
    const userRoleId = Number(req.params.id);
    const userRoleData = req.body;
    try {
        const tempUserRole = await prisma.usersRoles.findUnique({
            where: {
                id: userRoleId,
            },
        });
        if (!tempUserRole) {
            return res.status(404).send({ error: 'User role not found' });
        }
        const updatedUserRole = await prisma.usersRoles.update({
            where: {
                id: userRoleId,
            },
            data: userRoleData,
        });
        res.send(updatedUserRole);
    } catch (err) {
        next(err);
    }
});

userRolesRouter.delete('/:id', async (req, res, next) => {
    const userRoleId = Number(req.params.id);
    try {
        const deletedUserRole = await prisma.usersRoles.delete({
            where: {
                id: userRoleId,
            },
        });
        res.send(deletedUserRole);
    } catch (err) {
        next(err);
    }
});

export default userRolesRouter;