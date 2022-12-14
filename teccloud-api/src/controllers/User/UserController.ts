import { Request, Response, RequestHandler } from 'express';
import { Folder, sequelize, User } from '../../db';

class UserController {
  public register(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { firstName, lastName, username, password } = req.body;
      if (!username || !firstName || !username || !password) {
        return res.status(400).json({ error: 'All fields are required!' });
      }
      const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (!passwordPattern.test(password)) {
        return res
          .status(400)
          .json({ error: 'Password does not follow the requirements!' });
      }
      const hashedPassword = await User.hashPassword(password);
      let user;
      try {
        user = await sequelize.transaction(async (t) => {
          const folder = await Folder.create(
            { name: username },
            { transaction: t },
          );
          const user = await User.create(
            {
              firstName,
              lastName,
              username,
              password: hashedPassword,
              folderId: folder.id,
            },
            { transaction: t },
          );
          return user;
        });
      } catch (error) {
        return res
          .status(400)
          .json({ error: 'Username unavailable. Try a different one.' });
      }
      const token = await user.generateToken();
      res.cookie('authcookie', token);
      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        user,
      });
    };
  }

  public login(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res
          .status(401)
          .json({ error: 'Try again. Username and password do not match.' });
      }
      const matches = await user.comparePassword(password);
      if (!matches) {
        return res
          .status(401)
          .json({ error: 'Try again. Username and password do not match.' });
      }
      const token = await user.generateToken();
      res.cookie('authcookie', token);
      res.status(201).json({
        success: true,
        message: 'Login successful.',
        user,
      });
    };
  }

  public logout(): RequestHandler {
    return async (req: Request, res: Response) => {
      const user = await User.findByPk(req.userId);
      user?.update({ token: '' });
      res.clearCookie('authcookie');
      res.status(200).json({
        success: true,
        message: 'Logout successful.',
      });
    };
  }

  public isLoggedIn(): RequestHandler {
    return async (req: Request, res: Response) => {
      const user = await User.findByPk(req.userId);
      if (user !== null) {
        res.status(201).json({
          success: true,
          message: 'Active session.',
          user,
        });
      } else {
        // Only happens when clearing the DB
        res.sendStatus(401);
      }
    };
  }

  public isLoggedInAndOwnsFolder(): RequestHandler {
    return async (req: Request, res: Response) => {
      let folderId = parseInt(req.params.folderId);
      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Inactive session.',
        });
      }

      if (folderId === 0) {
        folderId = user!.folderId;
      }
      const folder = await Folder.findOne({ where: { id: folderId } });
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found.',
        });
      }

      if (!(await folder.isOwnedBy(user!))) {
        return res.status(403).json({
          success: false,
          message: 'Folder not owned by user.',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Active session.',
        user,
      });
    };
  }
}

export default new UserController();
