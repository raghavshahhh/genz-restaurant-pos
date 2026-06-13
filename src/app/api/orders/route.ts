import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await checkAuth();
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tableId = searchParams.get('tableId');

    let whereClause: any = {};
    if (status) whereClause.status = status.toUpperCase();
    if (tableId) whereClause.tableId = tableId;

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
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await checkAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { tableId, items, customerName, customerPhone } = body;

    // Fetch all menu items to get prices
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: items.map((i: any) => i.menuItemId)
        }
      }
    });

    // Create a map for quick price lookup
    const priceMap = new Map(menuItems.map(m => [m.id, m.price]));

    // Calculate total amount and prepare items for creation
    let totalAmount = 0;
    const orderItemsData = items.map((item: any) => {
      const price = priceMap.get(item.menuItemId) || 0;
      totalAmount += price * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: price,
        specialInstructions: item.specialInstructions
      };
    });

    const order = await prisma.order.create({
      data: {
        tableId,
        customerName,
        customerPhone,
        totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: orderItemsData
        }
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
