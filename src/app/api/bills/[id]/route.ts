import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/api-auth';

// GET single bill by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await checkAuth();
  if (auth.error) return auth.error;

  try {
    const bill = await prisma.bill.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true
              }
            }
          }
        },
        table: true
      }
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update bill status (mark as paid)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await checkAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { status, paymentMethod } = body;

    const bill = await prisma.bill.update({
      where: { id: params.id },
      data: {
        status,
        paymentMethod,
        paidAt: status === 'PAID' ? new Date() : null
      }
    });

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}