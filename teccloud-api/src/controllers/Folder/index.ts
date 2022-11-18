import { Router } from 'express';
import auth from '../../middleware/auth';
import FolderController from './FolderController';

const router = Router({ mergeParams: true });

router.post('/:folderId', auth, FolderController.create());
router.get('/search/:folderId', auth, FolderController.searchInFolder());
router.put('/rename', auth, FolderController.rename());
router.delete('/:folderId', auth, FolderController.delete());

export default router;
