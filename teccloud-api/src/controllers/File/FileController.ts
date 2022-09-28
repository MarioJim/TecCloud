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
              name: iconv.decode(encodedName, 'utf-8'),
              folderId: folderId,
              size: file.size,
              serverPath: file.path,
              accessByLink: 'private',
              lastViewed: new Date(),
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
}

export default new FileController();
