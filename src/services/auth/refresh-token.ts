import jwt from 'jsonwebtoken';
import type { Request, Response } from "express";

export default function refreshToken(req: Request, res: Response) {

    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET ?? '', (err, auth_object) => {
        console.log('auth_object', auth_object);
        if (err) return res.sendStatus(403);
        let newToken = jwt.sign(auth_object || {}, process.env.JWT_SECRET || '', {
            expiresIn: "1hr",
        });
        res.send({ token: newToken });
    })
}