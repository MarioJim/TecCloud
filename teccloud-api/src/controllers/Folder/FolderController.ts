import { Response, RequestHandler, Request } from 'express';
import { Folder, User, sequelize, File, PagesOnAFile } from '../../db';

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
          message: 'Folder with same name already exists.',
        });
      }

      let folder;
      try {
        folder = await sequelize.transaction(async (t) => {
          const folder = await Folder.create(
            {
              parentId: parseInt(folderId),
              name: folderName,
            },
            { transaction: t },
          );
          return folder;
        });
      } catch (error) {
        return res.status(500).json({ error: 'Error creating folder.' });
      }

      res.status(201).json({
        success: true,
        message: 'Folder created successfully.',
        folder: folder,
      });
    };
  }

  public searchInFolder(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { folderId } = req.params;
      const { q } = req.query;
      const { userId } = req;

      const folder = await Folder.findByPk(folderId);
      const user = await User.findByPk(userId);
      if (!folder || !user || !q || typeof q !== 'string') {
        return res.sendStatus(404);
      }

      let files = await File.findAll({
        where: { folderId },
        include: [{ association: PagesOnAFile, as: 'pages' }],
      });
      if (!(await folder.isOwnedBy(user))) {
        const filePermissions = await Promise.all(
          files.map((file) => file.viewableBy(user)),
        );
        files = files.filter((_, i) => filePermissions[i]);
      }

      const regex = new RegExp(q, 'i');
      const pages = files
        .flatMap((file: any) =>
          file.pages.map((page: any) => ({
            ...page.dataValues,
            file: file.dataValues,
          })),
        )
        .filter((page) => ((page.content || '') as string).match(regex));
      res.json(pages);
    };
  }

  public rename(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { folderId, folderName, newFolderName } = req.body;
      const { userId } = req;
      if (!folderId || !folderName || !newFolderName || !userId) {
        return res.sendStatus(401);
      }

      const folder = await Folder.findOne({ where: { id: folderId } });
      if (!folder) {
        return res.sendStatus(404).json({
          success: false,
          message: 'Folder not found.',
        });
      }

      const folders = await Folder.findAll({
        where: { parentId: folder.parentId, name: newFolderName },
      });
      if (folders.length !== 0) {
        return res.status(401).json({
          success: false,
          message: 'Folder with same name already exists.',
        });
      }

      const user = await User.findByPk(userId);
      if (!(user && (await folder.isOwnedBy(user)))) {
        return res.status(401).json({
          success: false,
          message: 'Folder not owned by user.',
        });
      }

      try {
        await folder.update({ name: newFolderName });

        res.status(200).send({
          success: true,
          message: 'File updated.',
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
      const { folderId } = req.params;
      const { userId } = req;
      if (!folderId || !userId) {
        return res.status(401).json({
          success: false,
          message: 'Folder or user not provided.',
        });
      }

      const folder = await Folder.findByPk(folderId);
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found.',
        });
      }

      const user = await User.findByPk(userId);
      if (!(user && (await folder.isOwnedBy(user)))) {
        return res.status(401).json({
          success: false,
          message: 'Folder not owned by user.',
        });
      }

      try {
        await folder.deleteOnServer();
      } catch (err) {
        console.error(err);
      }

      try {
        folder.destroy();

        res.status(200).send({
          success: true,
          message: 'Folder deleted.',
        });
      } catch (err) {
        return res.status(500).send({
          message: 'Could not retrieve folders.\n' + err,
        });
      }
    };
  }
}

export default new FolderController();
