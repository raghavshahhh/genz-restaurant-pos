import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBillSchema } from '@/lib/validations';
import { z } from 'zod';
import { checkRateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rateLimit';
import { createApiLogger, logDatabaseError, logValidationError } from '@/lib/logger';
import { successResponse, validationErrorResponse, CommonErrors } from '@/lib/apiResponse';

// GET bills with filtering
export async function GET(request: Request) {
  const logger = createApiLogger(request);
  
  // Apply rate limiting
  const rateLimit = checkRateLimit(request, RateLimitPresets.READ);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.resetAt);
  }

  try {
    logger.info('Fetching bills');
    
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    
    let whereClause: any = {};
    if (statusParam) {
      whereClause.status = statusParam.toUpperCase() as 'PENDING' | 'PAID';
    }

    const bills = await prisma.bill.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            table: true,
            items: {
              include: {
                menuItem: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    logger.info(`Fetched ${bills.length} bills`);
    return successResponse(bills);
  } catch (error) {
    logDatabaseError('fetch bills', error as Error, { statusParam: request.url });
    return CommonErrors.databaseError('Failed to fetch bills');
  }
}

// POST create a new bill
export async function POST(request: Request) {
  const logger = createApiLogger(request);
  
  // Apply rate limiting
  const rateLimit = checkRateLimit(request, RateLimitPresets.API);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validatedData = createBillSchema.parse(body);
    const { orderId } = validatedData;

    logger.info('Creating bill', { orderId });

    // Get the order details FIRST to validate status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!order) {
      logger.warn('Order not found', { orderId });
      return CommonErrors.notFound('Order');
    }

    // Validate order status BEFORE checking existing bill
    if (order.status !== 'COMPLETED') {
      logger.warn('Attempted to bill non-completed order', { orderId, status: order.status });
      return CommonErrors.badRequest('Only completed orders can be billed');
    }

    // Now check if bill already exists for this order
    const existingBill = await prisma.bill.findUnique({
      where: { orderId },
    });

    if (existingBill) {
      logger.warn('Bill already exists', { orderId, billId: existingBill.id });
      return CommonErrors.conflict('Bill already exists for this order');
    }

    // Calculate bill amounts
    const subtotal = order.totalAmount;
    const taxRate = parseFloat(process.env.TAX_RATE || '0.18'); // 18% GST
    const taxAmount = subtotal * taxRate;
    const discountAmount = 0; // Could be made configurable
    const finalAmount = subtotal + taxAmount - discountAmount;

    // Create the bill
    const bill = await prisma.bill.create({
      data: {
        orderId: order.id,
        tableId: order.tableId,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total: finalAmount,
        status: 'PENDING',
      },
    });

    logger.info('Bill created successfully', { billId: bill.id, total: finalAmount });
    return successResponse(bill, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logValidationError('create bill', (error as any).errors);
      return validationErrorResponse(error);
    }
    logDatabaseError('create bill', error as Error);
    return CommonErrors.databaseError('Failed to create bill');
  }
}