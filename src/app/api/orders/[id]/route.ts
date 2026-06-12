import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateOrderStatusSchema } from '@/lib/validations';
import { z } from 'zod';

// PATCH update order status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input with Zod
    const validatedData = updateOrderStatusSchema.parse(body);
    const { status } = validatedData;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true
          }
        }
      },
    });

    // If order is completed, update table status back to available
    if (status === 'COMPLETED' && order.table) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: {
          status: 'AVAILABLE',
        },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}