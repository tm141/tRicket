import express from 'express';
import adminUserRouter from './routes/adminUser';
import adminOrganizerRouter from './routes/adminOrganizers';
import adminTransactionRouter from './routes/adminTransaction';
import authAdminRouter from './routes/authAdmin';
import authUserRouter from './routes/authUser';
import authOrganizerRouter from './routes/authOrganizer';
import organizerRouter from './routes/organizers';
import userRouter from './routes/user';
import paymentTypeRouter from './routes/paymentTypes';
import cors from 'cors';

const app = express();
const port = 3000;

/**
 * GET request handler for the root endpoint.
 * @param req - Express Request object
 * @param res - Express Response object
 */
app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World!');
})
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}));

app.use('/api/admin/users', adminUserRouter);
app.use('/api/admin/organizers', adminOrganizerRouter);
app.use('/api/admin/transactions', adminTransactionRouter);

app.use('/api/admin/auth', authAdminRouter);
app.use('/api/user/auth', authUserRouter);
app.use('/api/organizer/auth', authOrganizerRouter);

app.use('/api/organizer', organizerRouter);
app.use('/api/user', userRouter);
app.use('/api/paymentTypes', paymentTypeRouter);

/**
 * Error handling middleware.
 * @param err - Error object
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction object
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.name === 'UnauthorizedError') {
        res.status(err.status).send({ error: err.message });
        return;
    }
    next(err);
});

app.listen(port, () => {
    console.log(`tRicket API listening on port ${port}`)
})