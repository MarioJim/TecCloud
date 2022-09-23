import { User } from '../../db';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

interface VerifiedUserPayload extends JwtPayload {
  id: number;
}

export interface RequestWithAuth extends Request {
  user?: User;
}

class UserController {
  public register() {
    return async (req: Request, res: Response) => {
      const { firstName, lastName, username, password } = req.body;
      if (!username || !firstName || !username || !password) {
        return Promise.reject(
          res.status(400).json({ error: 'All fields are required!' }),
        );
      }
      const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (!passwordPattern.test(password)) {
        return Promise.reject(
          res
            .status(400)
            .json({ error: 'Password does not follow the requeriments!' }),
        );
      }
      const hashedPassword = await User.hashPassword(password);
      let user;
      try {
        user = await User.create({
          firstName,
          lastName,
          username,
          password: hashedPassword,
        });
      } catch (error) {
        return Promise.reject(
          res
            .status(400)
            .json({ error: 'Username unavailable. Try a different one.' }),
        );
      }
      const token = await user.generateToken();
      res.cookie('authcookie', token);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user,
      });
    };
  }

  public login() {
    return async (req: Request, res: Response) => {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return Promise.reject(
          res
            .status(401)
            .json({ error: 'Try again. Username and password do not match.' }),
        );
      }
      const matches = await user.comparePassword(password);
      if (!matches) {
        return Promise.reject(
          res
            .status(401)
            .json({ error: 'Try again. Username and password do not match.' }),
        );
      }
      const token = await user.generateToken();
      res.cookie('authcookie', token);
      res.status(201).json({
        success: true,
        message: 'Login successful',
        user,
      });
    };
  }

  public isLoggedIn() {
    return async (req: RequestWithAuth, res: Response) => {
      const token = req.cookies.authcookie;
      console.log('cookie ', token);
      if (!token) {
        return Promise.reject(res.status(401).json({ error: 'No session.' }));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return Promise.reject(res.status(401).json({ error: 'No session.' }));
      }

      try {
        const data: VerifiedUserPayload = jwt.verify(
          token,
          jwtSecret,
        ) as VerifiedUserPayload;
        const user = await User.findByPk(data.id);
        if (user && user.token != token) {
          return Promise.reject(
            res.status(401).json({ error: 'No current session.' }),
          );
        }

        if (user) {
          res.cookie('authcookie', token);
          res.status(201).json({
            success: true,
            message: 'Active session',
            user,
          });
        } else {
          return Promise.reject(res.status(401).json({ error: 'No session.' }));
        }
      } catch (error) {
        return Promise.reject(res.status(401).json({ error: 'No session.' }));
      }
    };
  }
}

export default new UserController();
