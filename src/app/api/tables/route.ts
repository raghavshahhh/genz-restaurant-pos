import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTableSchema } from '@/lib/validations';
import { z } from 'zod';

// GET all tables
export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: {
        restaurant: true,
      },
      orderBy: {
        number: 'asc',
      },
    });
    return NextResponse.json(tables);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

// POST create a new table
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createTableSchema.parse(body);

    const table = await prisma.table.create({
      data: validatedData,
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 }
      );
    }
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}