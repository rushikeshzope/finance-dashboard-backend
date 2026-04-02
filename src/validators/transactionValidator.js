import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be a positive number'),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, 'Category is required'),
    date: z.string().datetime({ message: "Valid ISO datetime string required." }),
    notes: z.string().optional()
  })
});

export const updateTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be a positive number').optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().min(1).optional(),
    date: z.string().datetime().optional(),
    notes: z.string().optional()
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update"
  })
});
