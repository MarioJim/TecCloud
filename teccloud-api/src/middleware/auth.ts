import { Handler, NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';

const auth: Handler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.authcookie;
  if (!token) {
    return res.status(401).json({ error: 'No session.' });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'No session.' });
  }
};

export default auth;
