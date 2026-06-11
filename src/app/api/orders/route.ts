import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET orders with filtering by status
export async function GET(request: Request) {
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
  try {
    const { tableId, items } = await request.json();

    // Validate input
    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Table ID and items are required' },
        { status: 400 }
      );
    }

    // Check if table exists and is available
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    if (table.status === 'RESERVED' || table.status === 'OCCUPIED') {
      return NextResponse.json(
        { error: 'Table is not available for ordering' },
        { status: 400 }
      );
    }

    // Validate menu items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.menuItemId || !item.quantity) {
        return NextResponse.json(
          { error: 'Each item must have menuItemId and quantity' },
          { status: 400 }
        );
      }

      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item with id ${item.menuItemId} not found` },
          { status: 404 }
        );
      }

      if (!menuItem.available) {
        return NextResponse.json(
          { error: `Menu item ${menuItem.name} is not available` },
          { status: 400 }
        );
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions ?? null,
      });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        tableId,
        totalAmount,
        items: {
          create: orderItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true
          }
        }
      },
    });

    // Update table status to occupied
    await prisma.table.update({
      where: { id: tableId },
      data: {
        status: 'OCCUPIED',
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PATCH update order status
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
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

    // Update table status based on order status
    if (status === 'COMPLETED') {
      // When order is completed, make table available again
      await prisma.table.update({
        where: { id: order.tableId },
        data: {
          status: 'AVAILABLE',
        },
      });
    } else if (status === 'SERVED' || status === 'READY' || status === 'PREPARING' || status === 'PENDING') {
      // Keep table occupied while order is being processed
      await prisma.table.update({
        where: { id: order.tableId },
        data: {
          status: 'OCCUPIED',
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}