import fs from 'fs';
import path from 'path';
import { Response, RequestHandler, Request } from 'express';
import { Multer, MulterError } from 'multer';
import { File, FileAccess } from '../../db';
import { iso88591_to_utf8, utf8_to_iso88591 } from '../../utils/encoding';

class FileController {
  public upload(multerInstance: Multer): RequestHandler {
    return async (req: Request, res: Response) => {
      const { userId } = req;
      if (!userId) {
        return res.sendStatus(404);
      }

      multerInstance.array('files')(req, res, (error) => {
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

        const files = maybeFiles as Express.Multer.File[];
        Promise.all(
          files.map((file) =>
            File.create({
              fileId: file.filename,
              name: iso88591_to_utf8(file.originalname),
              folderId: folderId,
              size: file.size,
              fileType: file.mimetype,
            }),
          ),
        )
          .then((savedFiles) => {
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
      const { fileId } = req.params;
      const { userId } = req;
      if (!fileId || !userId) {
        return res.sendStatus(404);
      }

      let fileInfo = await File.findOne({ where: { fileId } });
      if (!fileInfo) {
        return res.sendStatus(404);
      }

      const accessableByUser = await fileInfo.accessableBy(userId);
      if (!accessableByUser) {
        return res.sendStatus(401);
      }

      const fileInServer = path.resolve(
        path.join(process.env.FILES_FOLDER as string, fileId),
      );
      if (fs.existsSync(fileInServer)) {
        fileInfo.lastViewed = new Date();
        fileInfo.timesViewed += 1;
        fileInfo = await fileInfo.save();
        const originalName = utf8_to_iso88591(fileInfo.name);
        res.set('Content-Disposition', `inline; filename="${originalName}"`);
        res.contentType(fileInfo.fileType);
        res.sendFile(fileInServer);
      } else {
        res.sendStatus(500);
      }
    };
  }

  public get(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { userId } = req;
      if (!userId) {
        return res.sendStatus(404);
      }

      let files = await File.findAll(/*{ where: {folderId: userId} }*/);
      if (!files) {
        return res.sendStatus(404);
      } else {
        console.log('success');
        console.log(files);
        console.log('success');
        res.json(files);
      }
    };
  }

  public delete(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { fileId } = req.params;
      const { userId } = req;
      if (!fileId || !userId) {
        return res.sendStatus(404);
      }

      let fileInfo = await File.findOne({ where: { fileId } });
      if (!fileInfo) {
        return res.sendStatus(404);
      }

      const accessableByUser = await fileInfo.accessableBy(userId);
      if (!accessableByUser) {
        return res.sendStatus(401);
      }

      const fileInServer = path.resolve(
        path.join(process.env.FILES_FOLDER as string, fileId),
      );

      try {
        fs.unlinkSync(fileInServer);
        await fileInfo.destroy();

        res.status(200).send({
          message: 'File deleted.',
        });
      } catch (err) {
        res.status(500).send({
          message: 'Could not delete the file. ' + err,
        });
      }
    };
  }
}

export default new FileController();
