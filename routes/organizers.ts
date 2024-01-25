import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './lib/authenticateJWT';

const organizersRouter = express.Router();
const prisma = new PrismaClient();

/**
 * Update the account information of an organizer.
 * @route PUT /account
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The updated organizer object.
 */
organizersRouter.put('/account', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const organizerData = req.body;
    try {
        const tempOrganizer = await prisma.organizers.findUnique({
            where: {
                id: organizerId,
            },
        });
        if (!tempOrganizer) {
            return res.status(404).send({ error: 'Organizer not found' });
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
});

/**
 * Get the account information of an organizer.
 * @route GET /account
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The organizer object.
 */
organizersRouter.get('/account', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    try {
        const organizer = await prisma.organizers.findUnique({
            where: {
                id: organizerId,
                archived: false,
            },
        });
        if (!organizer) {
            return res.status(404).send({ error: 'Organizer not found' });
        }
        res.send(organizer);
    } catch (err) {
        next(err);
    }
});

/**
 * Get a list of events organized by the authenticated organizer.
 * @route GET /events
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The list of events.
 */
organizersRouter.get('/events', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const name = req.query.name as string | undefined;
    const location = req.query.location as string | undefined;
    const isPaidEvent = req.query.isPaidEvent as boolean | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    try {
        const events = await prisma.events.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                organizersId: organizerId,
                name: name ? { contains: name } : undefined,
                showTime: {
                    gte: startDate ? new Date(startDate) : undefined,
                    lte: endDate ? new Date(endDate) : undefined,
                },
                location: location ? { contains: location } : undefined,
                isPaidEvent: isPaidEvent,
                archived: false,
            },
        });
        res.send(events);
    } catch (err) {
        next(err);
    }
});

/**
 * Get the details of a specific event organized by the authenticated organizer.
 * @route GET /events/:id
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The event object.
 */
organizersRouter.get('/events/:id', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
            },
        });
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (event.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        res.send(event);
    } catch (err) {
        next(err);
    }
});

/**
 * Create a new event for the authenticated organizer.
 * @route POST /events
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The created event object.
 */
organizersRouter.post('/events', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventData = req.body;
    eventData.organizersId = organizerId;
    const tempShowTime = eventData.showTime;
    eventData.showTime = new Date(tempShowTime);
    try {
        const createdEvent = await prisma.events.create({
            data: eventData,
        });
        res.send(createdEvent);
    } catch (err) {
        next(err);
    }
});

/**
 * Update the details of a specific event organized by the authenticated organizer.
 * @route PUT /events/:id
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The updated event object.
 */
organizersRouter.put('/events/:id', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    const eventData = req.body;
    try {
        const tempEvent = await prisma.events.findUnique({
            where: {
                id: eventId,
            },
        });
        if (!tempEvent) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (tempEvent.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const updatedEvent = await prisma.events.update({
            where: {
                id: eventId,
            },
            data: eventData,
        });
        res.send(updatedEvent);
    } catch (err) {
        next(err);
    }
});


/**
 * Delete a specific event organized by the authenticated organizer.
 * @route DELETE /events/:id
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The deleted event object.
 */
organizersRouter.delete('/events/:id', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    try {
        const tempEvent = await prisma.events.findUnique({
            where: {
                id: eventId,
                archived: false,
            },
        });
        if (!tempEvent) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (tempEvent.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const deletedEvent = await prisma.events.update({
            where: {
                id: eventId,
            },
            data: {
                archived: true,
            },
        });
        res.send(deletedEvent);
    } catch (err) {
        next(err);
    }
});

/**
 * Get a list of tickets for a specific event organized by the authenticated organizer.
 * @route GET /events/:id/tickets
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The list of tickets.
 */
organizersRouter.get('/events/:id/tickets', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;


    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
                archived: false,
            },
        });
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (event.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const tickets = await prisma.tickets.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                eventId: eventId,
                archived: false,
            },
        });
        res.send(tickets);
    } catch (err) {
        next(err);
    }
});

/**
 * Get the details of a specific ticket for a specific event organized by the authenticated organizer.
 * @route GET /events/:id/tickets/:ticketId
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The ticket object.
 */
organizersRouter.get('/events/:id/tickets/:ticketId', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    const ticketId = Number(req.params.ticketId);
    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
                archived: false,
            },
        });
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (event.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const ticket = await prisma.tickets.findUnique({
            where: {
                id: ticketId,
                archived: false,
            },
        });
        if (!ticket) {
            return res.status(404).send({ error: 'Ticket not found' });
        }
        res.send(ticket);
    } catch (err) {
        next(err);
    }
});

/**
 * Create a new ticket for a specific event organized by the authenticated organizer.
 * @route POST /events/:id/tickets
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The created ticket object.
 */
organizersRouter.post('/events/:id/tickets', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    const ticketData = req.body;
    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
                archived: false,
            },
        });
        if (!event || event.archived) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (event.showTime < new Date()){
            return res.status(400).send({ error: 'Event has passed' });
        }
        if (event.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const createdTicket = await prisma.tickets.create({
            data: ticketData,
        });
        res.send(createdTicket);
    } catch (err) {
        next(err);
    }
});

/**
 * Update the details of a specific ticket for a specific event organized by the authenticated organizer.
 * @route PUT /events/:id/tickets/:ticketId
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The updated ticket object.
 */
organizersRouter.put('/events/:id/tickets/:ticketId', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    const ticketId = Number(req.params.ticketId);
    const ticketData = req.body;
    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
            },
        });
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (event.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const tempTicket = await prisma.tickets.findUnique({
            where: {
                id: ticketId,
            },
        });
        if (!tempTicket) {
            return res.status(404).send({ error: 'Ticket not found' });
        }
        const updatedTicket = await prisma.tickets.update({
            where: {
                id: ticketId,
            },
            data: ticketData,
        });
        res.send(updatedTicket);
    } catch (err) {
        next(err);
    }
});

/**
 * Delete ticket for a specific event organized by the authenticated organizer.
 * @route DELETE /events/:id/tickets/:ticketId
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The deleted ticket object.
 */
organizersRouter.delete('/events/:id/tickets/:ticketId', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    const ticketId = Number(req.params.ticketId);
    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
            },
        });
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (event.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const tempTicket = await prisma.tickets.findUnique({
            where: {
                id: ticketId,
            },
        });
        if (!tempTicket) {
            return res.status(404).send({ error: 'Ticket not found' });
        }
        const deletedTicket = await prisma.tickets.update({
            where: {
                id: ticketId,
            },
            data: {
                archived: true,
            },
        });
        res.send(deletedTicket);
    } catch (err) {
        next(err);
    }
});

/**
 * Get a list of attendees for a specific event organized by the authenticated organizer.
 * @route GET /events/:id/attendees
 * @param {Request} req - The request object.
 * @param {Request} req.query.fName - The first name of the attendee.
 * @param {Request} req.query.lName - The last name of the attendee.
 * @param {Request} req.query.email - The email of the attendee.
 * @param {Request} req.query.phone - The phone number of the attendee.
 * @param {Request} req.query.address - The address of the attendee.
 * @param {Request} req.query.page - The page number.
 * @param {Request} req.query.limit - The number of items per page.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function. 
 * @returns {Response} The list of attendees.
 */
organizersRouter.get('/events/:id/attendees', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
            },
        });
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (event.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        //fix with find tickets owned by the event then find transactions/tickets that have that ticket then find the list of transaction from the table then find the userId from that table
        const tickets = await prisma.tickets.findMany({
            where: {
                eventId: eventId,
            },
        });
        const transactionsTickets = await prisma.transactionsTickets.findMany({
            where: {
                ticketId: {
                    in: tickets.map((ticket) => ticket.id),
                },
            },
        });
        const transactions = await prisma.transactions.findMany({
            where: {
                id: {
                    in: transactionsTickets.map((transactionTicket) => transactionTicket.transactionId),
                },
            },
        });


        const fName = req.query.fName as string | undefined;
        const lName = req.query.lName as string | undefined;
        const email = req.query.email as string | undefined;
        const phone = req.query.phone as string | undefined;
        const address = req.query.address as string | undefined;

        const attendees = await prisma.users.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                id: {
                    in: transactions.map((transaction) => transaction.userId),
                },
                fName: fName ? { contains: fName } : undefined,
                lName: lName ? { contains: lName } : undefined,
                email: email ? { contains: email } : undefined,
                phone: phone ? { contains: phone } : undefined,
                address: address ? { contains: address } : undefined,
                archived: false,
            },
        });

        res.send(attendees);
    } catch (err) {
        next(err);
    }
});

/**
 * get the list of transactions for a specific event organized by the authenticated organizer.
 * @route GET /events/:id/transactions
 * @param {Request} req - The request object.
 * @param {Request} req.query.paymentTypeId - The ID of the payment type.
 * @param {Request} req.query.minTotal - The minimum total of the transaction.
 * @param {Request} req.query.maxTotal - The maximum total of the transaction.
 * @param {Request} req.query.page - The page number.
 * @param {Request} req.query.limit - The number of items per page.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The list of transactions.
 */
organizersRouter.get('/events/:id/transactions', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const paymentTypeId = req.query.paymentTypeId as number | undefined;
    const minTotal = req.query.minTotal as number | undefined;
    const maxTotal = req.query.maxTotal as number | undefined;

    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
            },
        });
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (event.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const tickets = await prisma.tickets.findMany({
            where: {
                eventId: eventId,
            },
        });
        const transactionsTickets = await prisma.transactionsTickets.findMany({
            where: {
                ticketId: {
                    in: tickets.map((ticket) => ticket.id),
                },
            },
        });
        const transactions = await prisma.transactions.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                id: {
                    in: transactionsTickets.map((transactionTicket) => transactionTicket.transactionId),
                },
                paymentTypeId: paymentTypeId ? { equals: paymentTypeId } : undefined,
                total: {
                    gte: minTotal,
                    lte: maxTotal,
                },
                archived: false,
            },
        });
        res.send(transactions);
    } catch (err) {
        next(err);
    }
});

/**
 * Get the details of a specific transaction for a specific event organized by the authenticated organizer.
 * @route GET /events/:id/transactions/:transactionId
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response} The transaction object.
 */
organizersRouter.get('/events/:id/transactions/:transactionId', authenticateToken, async (req, res, next) => {
    if(req.user.isOrganizer === false){
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const organizerId = Number(req.user.id);
    const eventId = Number(req.params.id);
    const transactionId = Number(req.params.transactionId);
    try {
        const event = await prisma.events.findUnique({
            where: {
                id: eventId,
                archived: false,
            },
        });
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        if (event.organizersId !== organizerId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const transaction = await prisma.transactions.findUnique({
            where: {
                id: transactionId,
                archived: false,
            },
        });
        if (!transaction) {
            return res.status(404).send({ error: 'Transaction not found' });
        }
        res.send(transaction);
    } catch (err) {
        next(err);
    }
});



export default organizersRouter;