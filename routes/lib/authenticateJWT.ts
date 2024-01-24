import jwt from 'jsonwebtoken';
import express from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

interface CustomRequest<Params extends ParamsDictionary = ParamsDictionary> {
    user?: any;
}

declare module 'express-serve-static-core' {
    interface Request extends CustomRequest {}
}

export function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {

const authHeader = req.headers['authorization']
const token = authHeader && authHeader.split(' ')[1]

if (token == null) return res.sendStatus(401)

jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
})
}