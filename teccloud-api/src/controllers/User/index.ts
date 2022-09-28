import express from 'express';
import asyncHandler from 'express-async-handler';
import auth from '../../middleware/auth';
import UserController from './UserController';

const router = express.Router({ mergeParams: true });

router.post('/register', asyncHandler(UserController.register()));
router.post('/login', asyncHandler(UserController.login()));
router.get('/auth', auth, asyncHandler(UserController.isLoggedIn()));
router.post('/logout', auth, asyncHandler(UserController.logout()));

export default router;
