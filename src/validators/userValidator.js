import { z } from 'zod';

export const roleSchema = z.object({
  body: z.object({
    role: z.enum(['VIEWER', 'ANALYST', 'ADMIN'])
  })
});

export const statusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE'])
  })
});
