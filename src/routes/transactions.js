import { Router } from 'express';
import { createTransaction, getTransactions, getTransactionById, updateTransaction, deleteTransaction, exportTransactions, importTransactions } from '../controllers/transactionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transactionValidator.js';
import multer from 'multer';

// Storage configuration for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.use(authenticate);

// Reads: VIEWER, ANALYST, ADMIN
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/', requireRole('VIEWER', 'ANALYST', 'ADMIN'), getTransactions);

/**
 * @swagger
 * /api/transactions/export:
 *   get:
 *     summary: Export transactions to CSV
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export', requireRole('VIEWER', 'ANALYST', 'ADMIN'), exportTransactions);

/**
 * @swagger
 * /api/transactions/import:
 *   post:
 *     summary: Import transactions from CSV
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Successfully imported
 *       400:
 *         description: Bad request (invalid CSV)
 */
router.post('/import', requireRole('ADMIN'), upload.single('file'), importTransactions);


/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 */
router.get('/:id', requireRole('VIEWER', 'ANALYST', 'ADMIN'), getTransactionById);

// Writes: ADMIN only
/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post('/', requireRole('ADMIN'), validate(createTransactionSchema), createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 */
router.put('/:id', requireRole('ADMIN'), validate(updateTransactionSchema), updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted
 */
router.delete('/:id', requireRole('ADMIN'), deleteTransaction);

export default router;
