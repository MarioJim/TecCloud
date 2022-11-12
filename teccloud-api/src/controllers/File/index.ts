import { Router } from 'express';
import multer from 'multer';
import auth from '../../middleware/auth';
import FileController from './FileController';
import { filesFolder } from '../../config';
import shareChecks from '../../middleware/shareChecks';

const MB = 1024 * 1024;

const multerInstance = multer({
  dest: filesFolder,
  limits: { fileSize: 10 * MB },
});

const router = Router({ mergeParams: true });

router.post('/upload', auth, FileController.upload(multerInstance));
router.post(
  '/shareWithUser',
  auth,
  shareChecks,
  FileController.shareWithUser(),
);
router.post(
  '/unshareWithUser',
  auth,
  shareChecks,
  FileController.unshareWithUser(),
);
router.delete('/:fileName', auth, FileController.delete());
router.get('/download/:fileName', auth, FileController.download());
router.get('/:folderId', auth, FileController.get());

export default router;
