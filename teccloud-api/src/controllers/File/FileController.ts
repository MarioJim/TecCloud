import fs from 'fs';
import path from 'path';
import { Response, RequestHandler, Request } from 'express';
import iconv from 'iconv-lite';
import { File } from '../../db';

class FileController {
  public upload(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { files: maybeFiles } = req;
      const folderId = parseInt(req.body.folderId);
      if (!maybeFiles) {
        return res.status(201).json({
          success: true,
          message: 'No files uploaded',
        });
      }

      try {
        const files = maybeFiles as Express.Multer.File[];
        const savedFiles = await Promise.all(
          files.map((file) => {
            const encodedName = iconv.encode(file.originalname, 'iso-8859-1');
            return File.create({
              fileId: file.filename,
              name: iconv.decode(encodedName, 'utf-8'),
              folderId: folderId,
              size: file.size,
              fileType: file.mimetype,
              serverPath: file.path,
            });
          }),
        );

        res.status(201).json({
          success: true,
          message: 'Files uploaded successfully',
          files: savedFiles,
        });
      } catch (e) {
        res.status(500).json({
          success: true,
          message: `Error uploading files:\n${e}`,
        });
      }
    };
  }

  public download(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { fileId } = req.params;
      const { user } = req;
      if (!fileId || fileId.length !== 32 || !user) {
        return res.sendStatus(404);
      }

      const fileInfo = await File.findOne({ where: { fileId } });
      if (!fileInfo) {
        return res.sendStatus(404);
      }

      const accessableByUser = await fileInfo.accessableBy(user);
      if (!accessableByUser) {
        return res.sendStatus(401);
      }

      const fileInServer = path.resolve(
        path.join(process.env.FILES_FOLDER as string, fileId),
      );
      if (fs.existsSync(fileInServer)) {
        res.set('Content-Disposition', `inline; filename="${fileInfo.name}"`);
        res.contentType(fileInfo.fileType);
        res.sendFile(fileInServer);
      } else {
        res.sendStatus(500);
      }
    };
  }
}

export default new FileController();
