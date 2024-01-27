import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './lib/authenticateJWT';

const userRouter = express.Router();
const prisma = new PrismaClient();

/**
 * GET /events
 * Retrieves a list of events based on the specified filters.
 * Requires authentication token.
 * @name GET /events
 * @function
 * @memberof module:UserRouter
 * @param {string} req.query.name - The name of the event (optional).
 * @param {string} req.query.startDate - The start date of the event (optional).
 * @param {string} req.query.endDate - The end date of the event (optional).
 * @param {string} req.query.location - The location of the event (optional).
 * @param {number} req.query.page - The page number for pagination (optional, default: 1).
 * @param {number} req.query.limit - The maximum number of events to retrieve per page (optional, default: 10).
 * @returns {Array} An array of events that match the specified filters.
 * @throws {Error} If an error occurs while retrieving the events.
 */
userRouter.get('/events', async (req, res, next) => {
    const name = req.query.name as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const location = req.query.location as string;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    try {
        const events = await prisma.events.findMany({
            where: {
                archived: false,
                name: {
                    contains: name,
                },
                location: {
                    contains: location,
                },
                showTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        res.send(events);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /events/:id
 * Retrieves a specific event by its ID.
 * Requires authentication token.
 * @name GET /events/:id
 * @function
 * @memberof module:UserRouter
 * @param {number} req.params.id - The ID of the event.
 * @returns {Object} The event object if found, otherwise returns an error object.
 * @throws {Error} If an error occurs while retrieving the event.
 */
userRouter.get('/events/:id', async (req, res, next) => {
    const eventId = Number(req.params.id);
    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
            },
        });
        if (!event || event.archived) {
            return res.status(404).send({ error: 'Event not found' });
        }
        res.send(event);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /createTransactions
 * Creates a new transaction and associated transaction tickets.
 * Requires authentication token.
 * @name POST /createTransactions
 * @function
 * @memberof module:UserRouter
 * @param {Object} req.body.transaction - The transaction details.
 * @param {Array} req.body.transactionTickets - An array of transaction ticket details.
 * @returns {Object} The created transaction object if successful, otherwise returns an error object.
 * @throws {Error} If an error occurs while creating the transaction.
 */
userRouter.post('/createTransactions', authenticateToken, async (req, res, next) => {//req body should contain transaction detail and array of transactionTickets detail
    const transactionData = req.body.transaction;
    const transactionTicketsData = req.body.transactionTickets;
    let createdTransaction = null;
    try {
        createdTransaction = await prisma.transactions.create({
            data: transactionData,
        });
    } catch (err) {
        next(err);
    }

    if(!createdTransaction) {
        return res.status(500).send({ error: 'Failed to create transaction' });
    }

    transactionData.transactionId = createdTransaction.id;
    transactionTicketsData.forEach(async (transactionTicketData: any) => {
        try {
            const createdTransactionTicket = await prisma.transactionsTickets.create({
                data: transactionTicketData,
            });
            res.send(createdTransactionTicket);
        } catch (err) {
            next(err);
        }
    });

    res.status(201).send(createdTransaction);
});

/**
 * GET /transactions
 * Retrieves a list of transactions for the authenticated user.
 * Requires authentication token.
 * @name GET /transactions
 * @function
 * @memberof module:UserRouter
 * @param {string} req.query.startDate - The start date of the transactions (optional).
 * @param {string} req.query.endDate - The end date of the transactions (optional).
 * @param {number} req.query.page - The page number for pagination (optional, default: 1).
 * @param {number} req.query.limit - The maximum number of transactions to retrieve per page (optional, default: 10).
 * @returns {Array} An array of transactions that match the specified filters.
 * @throws {Error} If an error occurs while retrieving the transactions.
 */
userRouter.get('/transactions', authenticateToken, async (req, res, next) => {
    const userId = req.user.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    try {
        const transactions = await prisma.transactions.findMany({
            where: {
                userId: userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                archived: false,
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        res.send(transactions);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /transactions/:id
 * Retrieves a specific transaction by its ID for the authenticated user.
 * Requires authentication token.
 * @name GET /transactions/:id
 * @function
 * @memberof module:UserRouter
 * @param {number} req.params.id - The ID of the transaction.
 * @returns {Object} The transaction object if found and belongs to the authenticated user, otherwise returns an error object.
 * @throws {Error} If an error occurs while retrieving the transaction.
 */
userRouter.get('/transactions/:id', authenticateToken, async (req, res, next) => {
    const transactionId = Number(req.params.id);
    const userId = req.user.id;
    try {
        const transaction = await prisma.transactions.findUnique({
            where: {
                id: transactionId,
                archived: false,
            },
        });
        if (!transaction || transaction.archived) {
            return res.status(404).send({ error: 'Transaction not found' });
        }
        if (transaction.userId !== userId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        res.send(transaction);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /transaction/:id/transactionTickets
 * Retrieves the transaction and associated transaction tickets by the transaction ID for the authenticated user.
 * Requires authentication token.
 * @name GET /transaction/:id/transactionTickets
 * @function
 * @memberof module:UserRouter
 * @param {number} req.params.id - The ID of the transaction.
 * @returns {Object} The transaction object and an array of transaction tickets if found and belongs to the authenticated user, otherwise returns an error object.
 * @throws {Error} If an error occurs while retrieving the transaction and transaction tickets.
 */
userRouter.get('/transaction/:id/transactionTickets', authenticateToken, async (req, res, next) => {
    const userId = typeof (req.user.id) == 'number' ? req.user.id : Number(req.user.id);
    const transactionId = Number(req.params.id);
    try {
        const transaction = await prisma.transactions.findUnique({
            where: {
                id: transactionId,
                archived: false,
            },
        });
        if (!transaction || transaction.archived) {
            return res.status(404).send({ error: 'Transaction not found' });
        }
        if (transaction.userId !== userId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const transactionTickets = await prisma.transactionsTickets.findMany({
            where: {
                transactionId: transactionId,
                archived: false,
            },
        });
        res.send({ transaction, transactionTickets });
    } catch (err) {
        next(err);
    }
});

export default userRouter;