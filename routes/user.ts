import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { authenticateToken } from './lib/authenticateJWT';
import { parse } from 'path';
import { connect } from 'http2';

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
    const name = req.query.searchTerm as string;
    const startDate = req.query.startDate&& new Date(req.query.startDate as string);
    const endDate = req.query.endDate&& new Date(req.query.endDate as string);
    const location = req.query.location as string;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    console.log(req.query);
    console.log(name);
    console.log(startDate);
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
            include: {
                organizer: true,
                tickets: true,
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        res.send(events);
    } catch (err) {
        next(err);
    }
});



userRouter.get('/dashboard', authenticateToken, async (req, res, next) => {
    const userId = Number(req.user.id);
    try {
        const user = await prisma.users.findUnique({
            select: {
                fName: true,
                lName: true,
                email: true,
                points: true,
                pointsExpDate: true,
                referralCode: true,
                transactions: {
                    take: 10,
                },
                createdAt: true,
                archived: true,
            },
            where: {
                id: userId,
            },
        });
        if (!user || user.archived) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send(user);
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
            include: {
                organizer: true,
                tickets: true,
            }
        });
        if (!event || event.archived) {
            return res.status(404).send({ error: 'Event not found' });
        }
        res.send(event);
    } catch (err) {
        next(err);
    }
});

userRouter.get('/transaction/latest', authenticateToken, async (req, res, next) => {
    const userId = Number(req.user.id);
    try {
        const transaction = await prisma.transactions.findFirst({
            where: {
                userId: userId,
                archived: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!transaction || transaction.archived) {
            return res.status(404).send({ error: 'Transaction not found' });
        }
        res.send(transaction);
    } catch (err) {
        next(err);
    }
});

userRouter.post('/createTransaction', authenticateToken, async (req, res, next) => {//req body should contain transaction detail and array of transactionTickets detail
    const ticketId = Number(req.body.ticketId);
    const ticketAmount = Number(req.body.ticketAmount);
    const promoDateId = Number(req.body.promoDateId);
    const promoReferralId = Number(req.body.promoReferralId);
    const registerCoupon = JSON.parse(req.body.registerCoupon) || false;
    const referralCode = req.body.referralCode;
    const usePoints: boolean = JSON.parse(req.body.usePoints);
    console.log(req.body);

    if (!ticketId) {
        console.log("400 Missing ticket id");
        return res.status(400).send({ error: 'Missing transaction data' });
    }
    if (ticketAmount<1) {
        console.log("400 Wrong amount");
        return res.status(400).send({ error: 'Wrong Amount' });
    }

    let total = 0.0;

    try {
        const ticket = await prisma.tickets.findUnique({
            where: {
                id: ticketId,
                archived: false,
            },
        });
        if (!ticket) {
            console.log("404");
            return res.status(404).send({ error: 'Ticket not found' });
        }
        if (ticket.amount < ticketAmount) {
            console.log("400 not enough ticket")
            return res.status(400).send({ error: 'Not enough tickets available' });
        }
        if (ticket.amount == 0) {
            console.log("400 Ticket sold out")
            return res.status(400).send({ error: 'Ticket sold out' });
        }
        if (ticketAmount < 0) {
            console.log("400 Invalid ticket amount")
            return res.status(400).send({ error: 'Invalid ticket amount' });
        }
        if (ticketAmount > 10) {
            console.log("400 Maximum ticket amount exceeded")
            return res.status(400).send({ error: 'Maximum ticket amount exceeded' });
        }
        if (ticketAmount > ticket.amount) {
            console.log("400 Not enough tickets available")
            return res.status(400).send({ error: 'Not enough tickets available' });
        }

        let tempTicketPrice = parseFloat(ticket.price.toString());
        total = tempTicketPrice * ticketAmount;

        let discountDate = 0.0;
        let discountReferral = 0.0;
        let discountPoints = 0.0;
        let discountRegisterCoupon = 0.0;

        if (promoDateId) {
            try {
                const promosDate = await prisma.promosDate.findUnique({
                    where: {
                        id: promoDateId,
                        startDate: {
                            lte: new Date(),
                        },
                        endDate: {
                            gte: new Date(),
                        },
                        archived: false,
                    },
                });
                if (promosDate) {
                    discountDate = tempTicketPrice * (parseFloat(promosDate.discount.toString()) / 100);
                } else {
                    console.log("404 Promotion not found")
                    return res.status(404).send({ error: 'Promotion not found' });
                }

            } catch (err) {
                next(err);
            }
        }

        let referralUser = null;

        if (referralCode) {
            try {
                referralUser = await prisma.users.findUnique({
                    where: {
                        referralCode: referralCode,
                        archived: false,
                    },
                });
                if (!referralUser) {
                    console.log("404 Referraled user not found")
                    return res.status(404).send({ error: 'Referraled user not found' });
                }

            } catch (err) {
                next(err);
            }
        }

        if (promoReferralId && referralUser) {
            try {
                const promosReferral = await prisma.promosReferral.findUnique({
                    where: {
                        id: promoReferralId,
                        archived: false,
                    },
                });
                if (promosReferral) {
                    discountReferral = tempTicketPrice * (parseFloat(promosReferral.discount.toString()) / 100);
                } else {
                    console.log("404 Referal promo not found")
                    return res.status(404).send({ error: 'Referal promo not found' });
                }

            } catch (err) {
                next(err);
            }
        }

        if (usePoints) {
            const tempUser = await prisma.users.findUnique({
                where: {
                    id: req.user.id,
                    archived: false,
                },
            });
            let point = tempUser?.points ?? null;

            if (point) {
                let tempPoint = parseFloat(point.toString());
                if (tempPoint >= 0.0) {
                    discountPoints = tempPoint;
                }
            }
        }

        if(registerCoupon){
            discountRegisterCoupon = total * 0.1;
        }

        total = total - discountDate - discountReferral - discountPoints - discountRegisterCoupon;

        if (total < 0.0) {
            total = 0.0;
        }

        let transactionData = {
            userId: req.user.id,
            paymentTypeId: 2,
            total: total,
        };


        const createdTransaction = await prisma.transactions.create({
            data: transactionData,
        });

        if (!createdTransaction || !createdTransaction.id) {
            console.log("500 Error creating Transaction")
            return res.status(500).send({ error: 'Error creating Transaction' });
        }

        let transactionTicketData = {
            referralCode: referralCode,
            usePoints: usePoints,
            amount: ticketAmount,
            total: total,
            //@ts-ignore
            transaction: {connect: {id: createdTransaction.id}},
            //@ts-ignore
            ticket: {connect: {id: ticketId}},
            // //@ts-ignore
            // promosDate: {connect: {id: promoDateId}},
            // //@ts-ignore
            // promosReferral: {connect: {id: promoReferralId}},
        };
        
        if(promoDateId){
            transactionTicketData = {
                referralCode: referralCode,
                usePoints: usePoints,
                amount: ticketAmount,
                total: total,
                //@ts-ignore
                transaction: {connect: {id: createdTransaction.id}},
                //@ts-ignore
                ticket: {connect: {id: ticketId}},
                //@ts-ignore
                promosDate: {connect: {id: promoDateId}},
                // //@ts-ignore
                // promosReferral: {connect: {id: promoReferralId}},
            };
        }

        if(promoReferralId){
            transactionTicketData = {
                referralCode: referralCode,
                usePoints: usePoints,
                amount: ticketAmount,
                total: total,
                //@ts-ignore
                transaction: {connect: {id: createdTransaction.id}},
                //@ts-ignore
                ticket: {connect: {id: ticketId}},
                // //@ts-ignore
                // promosDate: {connect: {id: promoDateId}},
                //@ts-ignore
                promosReferral: {connect: {id: promoReferralId}},
            };
        }

        if(promoDateId && promoReferralId){
            transactionTicketData = {
                referralCode: referralCode,
                usePoints: usePoints,
                amount: ticketAmount,
                total: total,
                //@ts-ignore
                transaction: {connect: {id: createdTransaction.id}},
                //@ts-ignore
                ticket: {connect: {id: ticketId}},
                //@ts-ignore
                promosDate: {connect: {id: promoDateId}},
                //@ts-ignore
                promosReferral: {connect: {id: promoReferralId}},
            };
        }
        console.log(transactionTicketData);

        if (referralCode && promoReferralId && referralUser) {
            const updateRefferalUserPoint = await prisma.users.update({
                where: {
                    id: referralUser.id,
                },
                data: {
                    points: {
                        increment: 10000,
                    },
                },
            });
        }

        if(registerCoupon){
            const updateRegisterCoupon = await prisma.users.update({
                where: {
                    id: req.user.id,
                },
                data: {
                    registerCoupon: false,
                },
            });
        }

        const updateTicket = await prisma.tickets.update({
            where: {
                id: ticketId,
            },
            data: {
                amount: {
                    decrement: ticketAmount,
                },
            },
        });

        const createdTransactionTicket = await prisma.transactionsTickets.create({
            //@ts-ignore
            data: transactionTicketData,
        });
        console.log(createdTransactionTicket);
        console.log(updateTicket);
        res.status(201).send(createdTransaction);
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

    if (!transactionData || !transactionTicketsData) {
        return res.status(400).send({ error: 'Missing transaction data' });
    }

    if (!transactionData.paymentTypeId) {
        return res.status(400).send({ error: 'Missing payment type' });
    }

    let total = 0.0;
    let approvedTransactionTickets: {}[] = [];

    transactionTicketsData.forEach(async (transactionTicketData: any) => {

        if (!transactionTicketData.ticketId || !transactionTicketData.amount) {
            return res.status(400).send({ error: 'Missing ticket data' });
        }

        let referralUserId = null;
        let ticketTotal = 0.0;

        try {
            const ticket = await prisma.tickets.findUnique({
                where: {
                    id: transactionTicketData.ticketId,
                    archived: false,
                },
            });
            if (!ticket) {
                return res.status(404).send({ error: 'Ticket not found' });
            }
            if (ticket.amount < transactionTicketData.amount) {
                return res.status(400).send({ error: 'Not enough tickets available' });
            }
            if (ticket.amount == 0) {
                return res.status(400).send({ error: 'Ticket sold out' });
            }
            if (transactionTicketData.amount < 0) {
                return res.status(400).send({ error: 'Invalid ticket amount' });
            }
            if (transactionTicketData.amount > 10) {
                return res.status(400).send({ error: 'Maximum ticket amount exceeded' });
            }
            if (transactionTicketData.amount > ticket.amount) {
                return res.status(400).send({ error: 'Not enough tickets available' });
            }

            let tempTicketPrice = parseFloat(ticket.price.toString());
            ticketTotal = tempTicketPrice * transactionTicketData.amount;

            let promosDateId = transactionTicketData.promosDateId?.toString() ?? '';
            let promosReferralId = transactionTicketData.promosReferralId?.toString() ?? '';
            let referralCode = transactionTicketData.referralCode?.toString() ?? '';
            let tempUsePoints = transactionTicketData.usePoints ?? false;
            let discountDate = 0.0;
            let discountReferral = 0.0;
            let discountPoints = 0.0;

            if (promosDateId) {
                try {
                    const promosDate = await prisma.promosDate.findUnique({
                        where: {
                            id: promosDateId,
                            startDate: {
                                lte: new Date(),
                            },
                            endDate: {
                                gte: new Date(),
                            },
                            archived: false,
                        },
                    });
                    if (promosDate) {
                        discountDate = tempTicketPrice * (parseFloat(promosDate.discount.toString()) / 100);
                    } else {
                        return res.status(404).send({ error: 'Promotion not found' });
                    }

                } catch (err) {
                    next(err);
                }
            }
            let referralUser = null;

            if (referralCode) {
                try {
                    referralUser = await prisma.users.findUnique({
                        where: {
                            referralCode: referralCode,
                            archived: false,
                        },
                    });
                    if (referralUser) {
                        referralUserId = referralUser.id;
                    } else {
                        return res.status(404).send({ error: 'Referraled user not found' });
                    }
                } catch (err) {
                    next(err);
                }
            }

            if (promosReferralId && referralUser) {
                try {
                    const promosReferral = await prisma.promosReferral.findUnique({
                        where: {
                            id: promosReferralId,
                            archived: false,
                        },
                    });
                    if (promosReferral) {
                        discountReferral = tempTicketPrice * (parseFloat(promosReferral.discount.toString()) / 100);
                    } else {
                        return res.status(404).send({ error: 'Referal promo not found' });
                    }

                } catch (err) {
                    next(err);
                }
            }

            if (tempUsePoints === true) {
                const tempUser = await prisma.users.findUnique({
                    where: {
                        id: req.user.id,
                        archived: false,
                    },
                });
                let point = tempUser?.points ?? null;

                if (point) {
                    let tempPoint = parseFloat(point.toString());
                    if (tempPoint >= 0.0) {
                        discountPoints = tempPoint;
                    }
                }
            }
            ticketTotal = ticketTotal - discountDate - discountReferral - discountPoints;
            if (ticketTotal < 0.0) {
                ticketTotal = 0.0;
            }
            transactionTicketData.total = ticketTotal;
            transactionTicketData.referralCode = referralUserId;
            approvedTransactionTickets.push(transactionTicketData);
        } catch (err) {
            next(err);
        }
    });

    if (approvedTransactionTickets.length == transactionTicketsData.length) {
        try {
            transactionData.userId = req.user.id;
            const createdTransaction = await prisma.transactions.create({
                data: transactionData,
            });

            approvedTransactionTickets.forEach(async (approvedTransactionTicketData: any) => {
                approvedTransactionTicketData.transactionId = createdTransaction.id;
                try {
                    const createdTransactionTicket = await prisma.transactionsTickets.create({
                        data: approvedTransactionTicketData,
                    });
                    total += parseFloat(approvedTransactionTicketData.total.toString());
                    let tempDate = new Date();
                    tempDate.setMonth(tempDate.getMonth() + 8);
                    if (approvedTransactionTicketData.referralUserId) {
                        const updateRefferalUserPoint = await prisma.users.update({
                            where: {
                                id: approvedTransactionTicketData.referralCode,
                            },
                            data: {
                                points: {
                                    increment: 10000,
                                },
                                pointsExpDate: tempDate,
                            },
                        });
                    }
                    const updateTicket = await prisma.tickets.update({
                        where: {
                            id: approvedTransactionTicketData.ticketId,
                        },
                        data: {
                            amount: {
                                decrement: approvedTransactionTicketData.amount,
                            },
                        },
                    });
                } catch (err) {
                    next(err);
                }
            });

            try {
                const updatedTransaction = await prisma.transactions.update({
                    where: {
                        id: createdTransaction.id,
                    },
                    data: {
                        total: total,
                    },
                });
                const paymentTypeId = transactionData.paymentTypeId;
                if (paymentTypeId == 2 || paymentTypeId == 3 || paymentTypeId == 4) {
                    const updateTransaction = await prisma.transactions.update({
                        where: {
                            id: createdTransaction.id,
                        },
                        data: {
                            status: true,
                        },
                    });
                }
                res.status(201).send(updatedTransaction);
            } catch (err) {
                next(err);
            }

        } catch (err) {
            next(err);
        }
    } else {
        return res.status(500).send({ error: 'Error creating Transaction' });
    }
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
                transactionsTickets: {
                    some: {
                        archived: false,
                    },
                },
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
    const referralCode = req.user.referralCode?.toString() ?? '';
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
        const transactionTickets = await prisma.transactionsTickets.findMany({
            where: {
                transactionId: transactionId,
                archived: false,
            },
            include: {
                ticket: {
                    include: {
                        event: true,
                    },
                },
                promosDate: true,
                promosReferral: true,
            },
        });
        res.send(transactionTickets);
    } catch (err) {
        next(err);
    }
});

export default userRouter;