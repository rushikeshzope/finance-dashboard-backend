import { Router } from 'express';
import { getSummary, getCategories, getTrends, getRecent, getStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ANALYST', 'ADMIN')); // All dashboard routes are ANALYST and ADMIN only

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary
 */
router.get('/summary', getSummary);

/**
 * @swagger
 * /api/dashboard/categories:
 *   get:
 *     summary: Get expenses by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category data
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get transaction trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trend data
 */
router.get('/trends', getTrends);

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get recent transactions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent transactions
 */
router.get('/recent', getRecent);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get overall statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall statistics
 */
router.get('/stats', getStats);

export default router;
