import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrderSchema, updateOrderStatusSchema } from '@/lib/validations';
import { z } from 'zod';
import { checkRateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rateLimit';

// GET orders with filtering by status
export async function GET(request: Request) {
  // Apply rate limiting for read operations
  const rateLimit = checkRateLimit(request, RateLimitPresets.READ);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.resetAt);
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    let whereClause: any = {};
    if (statusParam) {
      const statuses = statusParam.split(',');
      whereClause.status = { in: statuses };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        table: true,
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create a new order
export async function POST(request: Request) {
  // Apply rate limiting for write operations
  const rateLimit = checkRateLimit(request, RateLimitPresets.API);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createOrderSchema.parse(body);
    const { tableId, items } = validatedData;

    // Use transaction to prevent race conditions
    const order = await prisma.$transaction(async (tx: any) => {
      // 1. Lock and check table availability
      const table = await tx.table.findUnique({
        where: { id: tableId },
      });

      if (!table) {
        throw new Error('Table not found');
      }

      if (table.status !== 'AVAILABLE') {
        throw new Error('Table is not available for ordering');
      }

      // 2. Validate menu items and calculate total
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
        });

        if (!menuItem) {
          throw new Error(`Menu item with id ${item.menuItemId} not found`);
        }

        if (!menuItem.available) {
          throw new Error(`Menu item ${menuItem.name} is not available`);
        }

        const itemTotal = menuItem.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price, // Capture price at time of order
          specialInstructions: item.specialInstructions,
        });
      }

      // 3. Create order
      const newOrder = await tx.order.create({
        data: {
          tableId,
          totalAmount,
          items: {
            create: orderItems,
          },
        },
        include: {
          table: true,
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });

      // 4. Update table status to occupied
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
