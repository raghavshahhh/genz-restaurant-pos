import { z } from 'zod';
import { sanitizeText } from './sanitize';

// Validation schemas for API inputs

export const createTableSchema = z.object({
  number: z.number().int().positive(),
  capacity: z.number().int().min(1).max(50),
  restaurantId: z.string().optional().default('default-restaurant-id'),
});

export const createMenuItemSchema = z.object({
  name: z.string().min(1).max(200).trim().transform(sanitizeText),
  category: z.string().min(1).max(100).trim().transform(sanitizeText),
  price: z.number().positive().max(100000),
  imageUrl: z.string().url().optional().or(z.literal('')),
  available: z.boolean().optional().default(true),
  restaurantId: z.string().optional().default('default-restaurant-id'),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).max(200).trim().transform(sanitizeText),
  category: z.string().min(1).max(100).trim().transform(sanitizeText),
  price: z.number().positive().max(100000),
  imageUrl: z.string().url().optional().or(z.literal('')),
  available: z.boolean().optional(),
});

export const createOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
  specialInstructions: z.string().max(500).trim().transform(sanitizeText).optional(),
});

export const createOrderSchema = z.object({
  tableId: z.string().uuid(),
  items: z.array(createOrderItemSchema).min(1).max(100),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED']),
});

export const createBillSchema = z.object({
  orderId: z.string().uuid(),
});

export const updateBillSchema = z.object({
  status: z.enum(['PAID', 'CANCELLED']),
  paymentMethod: z.string().max(50).trim().transform(sanitizeText).optional(),
});
