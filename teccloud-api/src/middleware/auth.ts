import { Handler, NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from '../db';

type VerifiedUserPayload = jwt.JwtPayload & { id: number };

const auth: Handler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.authcookie;
  const jwtSecret = process.env.JWT_SECRET;
  if (!token || !jwtSecret) {
    return res.status(401).json({ error: 'No session.' });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as VerifiedUserPayload;
    const user = await User.findByPk(decodedToken.id);
    if (user && user.token === token) {
      req.user = user;
      res.cookie('authcookie', token);
      return next();
    }
  } catch (error) {}

  res.status(401).json({ error: 'No session.' });
};

export default auth;
