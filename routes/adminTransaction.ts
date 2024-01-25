/**
 * Express router for handling admin transactions.
 * @module adminTransactionRouter
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './lib/authenticateJWT';

const adminTransactionRouter = express.Router();
const prisma = new PrismaClient();

/**
 * PUT route for updating a transaction by ID.
 * @name PUT /adminTransaction/:id
 * @function
 * @memberof module:adminTransactionRouter
 * @param {string} id - The ID of the transaction to be updated.
 * @param {function} authenticateToken - Middleware function to authenticate the user's token.
 * @param {function} async - Asynchronous function to handle the request.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The updated transaction.
 */
adminTransactionRouter.put('/:id', authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== '2') {
        res.status(401).send({ error: 'Unauthorized' });
    }
    const transactionId = Number(req.params.id);
    const transactionData = req.body;
    try {
        const tempTransaction = await prisma.transactions.findUnique({
            where: {
                id: transactionId,
            },
        });
        if (!tempTransaction) {
            return res.status(404).send({ error: 'Transaction not found' });
        }
        const updatedTransaction = await prisma.transactions.update({
            where: {
                id: transactionId,
            },
            data: transactionData,
        });
        res.send(updatedTransaction);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE route for archiving a transaction by ID.
 * @name DELETE /adminTransaction/:id
 * @function
 * @memberof module:adminTransactionRouter
 * @param {string} id - The ID of the transaction to be archived.
 * @param {function} authenticateToken - Middleware function to authenticate the user's token.
 * @param {function} async - Asynchronous function to handle the request.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} The archived transaction.
 */
adminTransactionRouter.delete('/:id', authenticateToken, async (req, res, next) => {
    if (req.user.roleId !== '2') {
        res.status(401).send({ error: 'Unauthorized' });
    }
    const transactionId = Number(req.params.id);
    try {
        const deletedTransaction = await prisma.transactions.update({
            where: {
                id: transactionId,
            },
            data: {
                archived: true,
            },
        });
        res.send(deletedTransaction);
    } catch (err) {
        next(err);
    }
});

export default adminTransactionRouter;