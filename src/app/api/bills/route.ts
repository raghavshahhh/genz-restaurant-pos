import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET bills with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    let whereClause: any = {};
    if (statusParam) {
      whereClause.status = statusParam.toUpperCase();
    }

    const bills = await prisma.bill.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true
              }
            },
            table: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new bill
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, tableId, subtotal, tax, discount = 0, total } = body;

    const bill = await prisma.bill.create({
      data: {
        orderId,
        tableId,
        subtotal,
        tax,
        discount,
        total,
        status: 'PENDING'
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}