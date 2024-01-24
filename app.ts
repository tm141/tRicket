import express from 'express';
import userRouter from './routes/user';
import organizerRouter from './routes/organizers';
import adminAuthRouter from './routes/adminAuth';
import userAuth from './routes/userAuth';

const app = express();
const port = 3000;


app.get('/', (req:express.Request,res:express.Response)=>{
    res.send('Hello World!');
})
app.use(express.json());  

app.use('/api/users', userRouter);
app.use('/api/organizers', organizerRouter);

app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/user/auth', userAuth);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.name === 'UnauthorizedError') {
        res.status(err.status).send({ error: err.message });
        return;
    }
    next(err);
});

app.listen(port, ()=>{
    console.log(`tRicket API listening on port ${port}`)
})