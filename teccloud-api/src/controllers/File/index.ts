import { Router } from 'express';
import multer from 'multer';
import auth from '../../middleware/auth';
import FileController from './FileController';

const MB = 1024 * 1024;

const multerInstance = multer({
  dest: process.env.FILES_FOLDER,
  limits: { fileSize: 10 * MB },
});

const router = Router({ mergeParams: true });

router.post('/upload', auth, FileController.upload(multerInstance));
router.delete('/:fileName', auth, FileController.delete());
router.get('/download/:fileName', auth, FileController.download());
router.get('/:folderId', auth, FileController.get());
router.post('/:folderId', auth, FileController.createFolder());

export default router;
