import fs from 'fs';
import fsPromises from 'fs/promises';
import { Response, RequestHandler, Request } from 'express';
import { Multer, MulterError } from 'multer';
import { Op } from 'sequelize';
import { File, Folder, Page, PagesOnAFile, User } from '../../db';
import { iso88591_to_utf8, utf8_to_iso88591 } from '../../utils/encoding';
import { get_file_server_path } from '../../utils/files';
import { channel } from '../../queue';

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
              message: 'File too large',
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

        try {
          let savedFiles = await Promise.all(
            files
              .filter((file) => !duplicateNames.has(file.originalname))
              .map(async (file) => {
                const fileInDB = await File.create({
                  fileName: file.filename,
                  originalName: iso88591_to_utf8(file.originalname),
                  folderId: folderId,
                  size: file.size,
                  fileType: file.mimetype,
                });
                (await channel).queueFile(fileInDB);
                return fileInDB;
              }),
          );

          await user.addFiles(savedFiles, {
            through: { ownerId: userId },
          });

          res.status(201).json({
            success: true,
            message: 'Files uploaded successfully',
            files: await user.getFiles({
              where: { folderId },
              include: [
                { model: User },
                { association: PagesOnAFile, as: 'pages' },
              ],
            }),
          });
        } catch (e) {
          res.status(500).json({
            success: false,
            message: `Error uploading files:\n${e}`,
          });
        }
      });
    };
  }

  public get(): RequestHandler {
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
      const otherUser = req.body.otherUser as User;
      const fileInfo = req.body.fileInfo as File;

      await fileInfo.addUser(otherUser, {
        through: { ownerId: userId },
      });
      const newFile = await File.findOne({
        where: { fileName: fileInfo.fileName },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'username', 'folderId'],
          },
        ],
      });
      res.json(newFile);
    };
  }

  public unshareWithUser(): RequestHandler {
    return async (req: Request, res: Response) => {
      const otherUser = req.body.otherUser as User;
      const fileInfo = req.body.fileInfo as File;

      await fileInfo.removeUser(otherUser);
      const newFile = await File.findOne({
        where: { fileName: fileInfo.fileName },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'username', 'folderId'],
          },
        ],
      });
      res.json(newFile);
    };
  }

  public changeGeneralAccess(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { fileName } = req.params;
      const { userId } = req;
      const generalAccess = req.body.generalAccess;
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

      if (generalAccess !== 'public' && generalAccess !== 'private') {
        return res.sendStatus(400);
      }

      await fileInfo.update({ accessByLink: generalAccess });
      res.sendStatus(200);
    };
  }

  public getThumbnail(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { fileName } = req.params;
      const { userId } = req;
      if (!fileName || !userId) {
        return res.sendStatus(404);
      }

      const pageInfo = await Page.findOne({
        where: { thumbnailPath: fileName },
      });
      if (!pageInfo) {
        return res.sendStatus(404);
      }

      const fileInfo = await File.findByPk(pageInfo.fileId);
      if (!fileInfo) {
        console.error(
          `Couldn't find file ${pageInfo.fileId} for thumbnail '${fileName}', page ${pageInfo.number}`,
        );
        return res.sendStatus(500);
      }

      const user = await User.findByPk(userId);
      if (!(user && (await fileInfo.accessableBy(user)))) {
        return res.sendStatus(401);
      }

      const fileInServer = get_file_server_path(fileName);
      if (fs.existsSync(fileInServer)) {
        const originalName = utf8_to_iso88591(fileInfo.originalName);
        res.set(
          'Content-Disposition',
          `inline; filename="Page ${pageInfo.number} of '${originalName}'"`,
        );
        res.sendFile(fileInServer);
      } else {
        res.sendStatus(500);
      }
    };
  }

  public getFolder(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { folderId } = req.params;
      const { userId } = req;

      const folder = await Folder.findByPk(folderId);
      const user = await User.findByPk(userId);
      if (!folder || !user) {
        return res.sendStatus(404);
      }

      const folders = await Folder.findAll({ where: { parentId: folderId } });

      let files = await user.getFiles({
        where: { folderId },
        include: [{ model: User }, { association: PagesOnAFile, as: 'pages' }],
      });
      if (!(await folder.isOwnedBy(user))) {
        const filePermissions = await Promise.all(
          files.map((file) => file.viewableBy(user)),
        );
        files = files.filter((_, i) => filePermissions[i]);
      }

      res.json({ files, folders, parentId: folder.parentId });
    };
  }

  public getShared(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { userId } = req;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.sendStatus(404);
      }

      const files = await user.getFiles({
        where: { '$file_access.ownerId$': { [Op.ne]: userId } },
        include: [{ model: User }, { association: PagesOnAFile, as: 'pages' }],
      });

      res.json(files);
    };
  }

  public rename(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { folderId, fileName, originalName, newFileName } = req.body;
      const { userId } = req;
      if (!folderId || !fileName || !originalName || !newFileName || !userId) {
        return res.sendStatus(401);
      }

      const re = /(?:\.([^.]+))?$/;
      const ext = re.exec(originalName)![1];
      const updatedFileName = [newFileName, ext].join('.');

      const file = await File.findOne({ where: { fileName } });
      if (!file) {
        return res.sendStatus(404).json({
          success: false,
          message: 'File not found.',
        });
      }

      const files = await File.findAll({
        where: { folderId: folderId, originalName: updatedFileName },
      });
      if (files.length !== 0) {
        return res.status(401).json({
          success: false,
          message: 'File with same name already exists.',
        });
      }

      const user = await User.findByPk(userId);
      if (!(user && (await file.ownedBy(user)))) {
        return res.sendStatus(403);
      }

      try {
        await file.update({ originalName: updatedFileName });

        res.status(200).send({
          message: 'File updated.',
          updatedFileName: updatedFileName,
        });
      } catch (err) {
        res.status(500).send({
          message: 'Could not update file.\n' + err,
        });
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

      try {
        await fileInfo.deleteOnServer();
      } catch (err) {
        console.error(err);
      }

      try {
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
