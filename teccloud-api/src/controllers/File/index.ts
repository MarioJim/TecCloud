import { Router } from 'express';
import multer from 'multer';
import auth from '../../middleware/auth';
import FileController from './FileController';

const MB = 1024 * 1024;

const upload = multer({
  dest: process.env.FILES_FOLDER,
  limits: { fileSize: 10 * MB },
});

const router = Router({ mergeParams: true });

router.post('/upload', auth, upload.array('files'), FileController.upload());

export default router;
