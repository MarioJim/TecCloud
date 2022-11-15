import fsPromises from 'fs/promises';
import { Response, RequestHandler, Request } from 'express';
import { File, Folder, User } from '../../db';
import { get_file_server_path } from '../../utils/files';

class FolderController {
  public create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { folderName } = req.body;
      const { folderId } = req.params;
      const { userId } = req;
      if (!folderId || !userId) {
        return res.sendStatus(401);
      }

      const folders = await Folder.findAll({
        where: { parentId: folderId, name: folderName },
      });
      if (folders.length !== 0) {
        return res.status(401).json({
          success: false,
          message: `Folder with same name already exists`,
        });
      }

      Promise.resolve(
        Folder.create({
          parentId: parseInt(folderId),
          name: folderName,
        }),
      )
        .then((folder) => {
          res.status(201).json({
            success: true,
            message: 'Folder created successfully',
            folder: folder,
          });
        })
        .catch((e) => {
          res.status(500).json({
            success: false,
            message: `Error creating folder`,
          });
        });
    };
  }

  public delete(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { folderId } = req.params;
      const { userId } = req;
      if (!folderId || !userId) {
        return res.status(401).json({
          success: false,
          message: 'Folder or user not provided',
        });
      }

      const folder = await Folder.findOne({ where: { id: folderId } });
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found',
        });
      }

      const user = await User.findByPk(userId);
      if (!(user && (await folder.isOwnedBy(user)))) {
        return res.status(401).json({
          success: false,
          message: 'Folder not owned by user',
        });
      }

      try {
        let folder = await Folder.findByPk(folderId);
        folder?.destroy();
      } catch (err) {
        return res.status(500).send({
          message: 'Could not retrieve folders.\n' + err,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Test passed',
      });
    };
  }
}

export default new FolderController();
