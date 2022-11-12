import fs from 'fs';
import fsPromises from 'fs/promises';
import { Response, RequestHandler, Request } from 'express';
import { Multer, MulterError } from 'multer';
import { File, Folder, User } from '../../db';
import { iso88591_to_utf8, utf8_to_iso88591 } from '../../utils/encoding';
import { get_file_server_path } from '../../utils/files';
import { Op } from 'sequelize';

class FileController {
  public upload(multerInstance: Multer): RequestHandler {
    return async (req: Request, res: Response) => {
      const { userId } = req;
      if (!userId) {
        return res.sendStatus(401);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.sendStatus(401);
      }

      multerInstance.array('files')(req, res, async (error) => {
        if (error instanceof MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              success: false,
              message: `File too large`,
            });
          } else {
            return res.status(500).json({
              success: false,
              message: `Error uploading files:\n${error.message}`,
            });
          }
        } else if (error) {
          return res.status(500).json({
            success: false,
            message: `Error uploading files:\n${error}`,
          });
        }

        const { files: maybeFiles } = req;
        const folderId = parseInt(req.body.folderId);
        if (!maybeFiles) {
          return res.status(201).json({
            success: true,
            message: 'No files uploaded',
          });
        }

        let files = maybeFiles as Express.Multer.File[];

        const duplicateFiles = await File.findAll({
          where: {
            folderId,
            originalName: {
              [Op.or]: files.map((file) => iso88591_to_utf8(file.originalname)),
            },
          },
        });
        const duplicateNames = new Set<string>();
        duplicateFiles.forEach((file) =>
          duplicateNames.add(utf8_to_iso88591(file.originalName)),
        );

        const eraseFiles = files.filter((file) =>
          duplicateNames.has(file.originalname),
        );

        try {
          await Promise.all(
            eraseFiles.map((file) =>
              fsPromises.unlink(get_file_server_path(file.filename)),
            ),
          );
        } catch (error) {
          console.error(error);
        }

        files = files.filter((file) => !duplicateNames.has(file.originalname));
        Promise.all(
          files.map((file) =>
            File.create({
              fileName: file.filename,
              originalName: iso88591_to_utf8(file.originalname),
              folderId: folderId,
              size: file.size,
              fileType: file.mimetype,
            }),
          ),
        )
          .then(async (savedFiles) => {
            await user.addFiles(savedFiles);
            savedFiles = await user.getFiles({ include: [{ model: User }] });
            res.status(201).json({
              success: true,
              message: 'Files uploaded successfully',
              files: savedFiles,
            });
          })
          .catch((e) => {
            res.status(500).json({
              success: false,
              message: `Error uploading files:\n${e}`,
            });
          });
      });
    };
  }

  public download(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { fileName } = req.params;
      const { userId } = req;
      if (!fileName || !userId) {
        return res.sendStatus(404);
      }

      let fileInfo = await File.findOne({ where: { fileName } });
      if (!fileInfo) {
        return res.sendStatus(404);
      }

      const user = await User.findByPk(userId);
      if (!(user && (await fileInfo.accessableBy(user)))) {
        return res.sendStatus(401);
      }

      const fileInServer = get_file_server_path(fileName);
      if (fs.existsSync(fileInServer)) {
        fileInfo.lastViewed = new Date();
        fileInfo.timesViewed += 1;
        fileInfo = await fileInfo.save();
        const originalName = utf8_to_iso88591(fileInfo.originalName);
        res.set('Content-Disposition', `inline; filename="${originalName}"`);
        res.contentType(fileInfo.fileType);
        res.sendFile(fileInServer);
      } else {
        res.sendStatus(500);
      }
    };
  }

  public shareWithUser(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { userId } = req;
      const fileName = req.body.filename;
      const addUser = req.body.addUser;

      if (!fileName || !userId || !addUser) {
        return res.status(404).json({
          message: 'Missing inut information. Try reloading.\n',
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

      const newUser = await User.findOne({ where: { username: addUser } });
      if (!newUser) {
        return res.status(404).json({
          message: 'Username does not exist. Try with another one.\n',
        });
      }

      await fileInfo.addUser(newUser);
      fileInfo = await File.findOne({ where: { fileName }, include: User });
      res.json(fileInfo);
    };
  }

  public get(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { folderId } = req.params;
      const { userId } = req;

      const folder = await Folder.findByPk(folderId);
      const user = await User.findByPk(userId);
      if (!folder || !user) {
        return res.sendStatus(404);
      }

      const files = await File.findAll({
        where: { folderId },
        include: [{ model: User }],
      });
      if (await folder.isOwnedBy(user)) {
        res.json(files);
      } else {
        const filePermissions = await Promise.all(
          files.map((file) => file.viewableBy(user)),
        );
        res.json(files.filter((_, i) => filePermissions[i]));
      }
    };
  }

  public delete(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { fileName } = req.params;
      const { userId } = req;
      if (!fileName || !userId) {
        return res.sendStatus(401);
      }

      const fileInfo = await File.findOne({ where: { fileName } });
      if (!fileInfo) {
        return res.sendStatus(404);
      }

      const user = await User.findByPk(userId);
      if (!(user && (await fileInfo.ownedBy(user)))) {
        return res.sendStatus(401);
      }

      const fileInServer = get_file_server_path(fileName);
      try {
        await fsPromises.unlink(fileInServer);
        await fileInfo.destroy();

        res.status(200).send({
          message: 'File deleted.',
        });
      } catch (err) {
        res.status(500).send({
          message: 'Could not delete the file.\n' + err,
        });
      }
    };
  }
}

export default new FileController();
