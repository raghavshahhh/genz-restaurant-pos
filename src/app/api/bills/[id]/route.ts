import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateBillSchema } from '@/lib/validations';
import { z } from 'zod';

// PATCH update bill status (mark as paid)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input with Zod
    const validatedData = updateBillSchema.parse(body);
    const { status, paymentMethod } = validatedData;

    // Check if bill exists
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        order: true,
      }
    });

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    // Only allow PAID status (CANCELLED would need different logic)
    if (status !== 'PAID') {
      return NextResponse.json(
        { error: 'Only PAID status is currently supported' },
        { status: 400 }
      );
    }

    // Update bill
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: { 
        status: 'PAID',
        paymentMethod: paymentMethod || null,
        paidAt: new Date(),
      },
      include: {
        order: {
          include: {
            table: true,
          }
        }
      },
    });

    // Update order payment status
    await prisma.order.update({
      where: { id: bill.orderId },
      data: {
        paymentStatus: 'PAID',
      },
    });

    return NextResponse.json(updatedBill);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update bill status' },
      { status: 500 }
    );
  }
}