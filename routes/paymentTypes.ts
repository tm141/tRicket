import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const paymentTypeRouter = express.Router();

paymentTypeRouter.get('/', async (req, res, next) => {
    try {
        const paymentTypes = await prisma.paymentTypes.findMany();
        res.send(paymentTypes);
    } catch (err) {
        next(err);
    }
});

export default paymentTypeRouter;