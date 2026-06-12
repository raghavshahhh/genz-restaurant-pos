import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMenuItemSchema } from '@/lib/validations';
import { z } from 'zod';

// GET all menu items
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        available: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(menuItems);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// POST create a new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createMenuItemSchema.parse(body);

    const menuItem = await prisma.menuItem.create({
      data: {
        ...validatedData,
        imageUrl: validatedData.imageUrl || '/placeholder.png',
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 }
      );
    }
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}