import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE a table
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if table exists
    const table = await prisma.table.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Check if table has active orders
    const activeOrders = await prisma.order.count({
      where: {
        tableId: id,
        status: {
          notIn: ['COMPLETED', 'SERVED'],
        },
      },
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete table with active orders' },
        { status: 400 }
      );
    }

    await prisma.table.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    );
  }
}