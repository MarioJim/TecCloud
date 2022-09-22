import { User } from '../../db';
import { Request, Response } from 'express';
import CustomError from '../../middleware/customError';

class UserController {
  public register() {
    return async (req: Request, res: Response) => {
      const { firstName, lastName, username, password } = req.body;
      if (!username || !firstName || !username || !password)
        return Promise.reject(new CustomError(400, 'All fields are required!'));
      const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (!passwordPattern.test(password)) {
        return Promise.reject(
          new CustomError(400, 'Password does not follow the requeriments!'),
        );
      }
      const hashedPassword = await User.hashPassword(password);
      const user = await User.create({
        firstName,
        lastName,
        username,
        password: hashedPassword,
      });
      await user.generateToken();
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
      if (!user)
        return Promise.reject(
          new CustomError(
            401,
            'Try again. Username and password do not match.',
          ),
        );
      const matches = await user.comparePassword(password);
      if (!matches)
        return Promise.reject(
          new CustomError(
            401,
            'Try again. Username and password do not match.',
          ),
        );
      await user.generateToken();
      res.status(201).json({
        success: true,
        message: 'Login successful',
        user,
      });
    };
  }
}

export default new UserController();
