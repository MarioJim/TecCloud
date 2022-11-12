import { Handler, NextFunction, Request, Response } from 'express';
import { File, User } from '../db';

const shareChecks: Handler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;
  const fileName = req.body.filename;
  const otherUsername = req.body.otherUsername;

  if (!fileName || !userId || !otherUsername) {
    return res.status(404).json({
      message: 'Missing input information. Try reloading.\n',
    });
  }

  let fileInfo = await File.findOne({ where: { fileName } });
  if (!fileInfo) {
    return res.status(404).json({
      message: 'File does not exist. Try reloading.\n',
    });
  }

  const user = await User.findByPk(userId);
  if (!(user && (await fileInfo.ownedBy(user)))) {
    return res.status(401).json({
      message: 'Unauthorized. Verify your session and permissions.\n',
    });
  }

  if (user.username === otherUsername) {
    return res.status(400).json({
      message: 'Cannot modify yourself.\n',
    });
  }

  const otherUser = await User.findOne({ where: { username: otherUsername } });
  if (!otherUser) {
    return res.status(404).json({
      message: 'Username does not exist. Try with another one.\n',
    });
  }

  req.body.fileInfo = fileInfo;
  req.body.otherUser = otherUser;
  next();
  const token = req.cookies.authcookie;
  if (!token) {
    return res.status(401).json({ error: 'No session.' });
  }
};

export default shareChecks;
