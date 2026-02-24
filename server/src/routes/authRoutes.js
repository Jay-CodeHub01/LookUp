import express from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

// public routes
router.post('/register', register);
router.post('/login', login);

// protected route
router.get('/me', protect, getMe);

export default router;
