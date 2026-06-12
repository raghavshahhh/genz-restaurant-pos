import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const RESTAURANT_ID = 'genz-restaurant';
const RESTAURANT_NAME = 'Gen-Z Restaurant';

export async function POST() {
  try {
    console.log('Starting Restaurant Simulation...');

    // 0. Create Restaurant first (required for foreign keys)
    console.log('Creating restaurant...');
    let restaurant = await prisma.restaurant.findUnique({
      where: { id: RESTAURANT_ID },
    });

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          id: RESTAURANT_ID,
          name: RESTAURANT_NAME,
          address: '123 Main Street, New Delhi, India',
        },
      });
      console.log('Restaurant created:', restaurant.name);
    } else {
      console.log('Restaurant already exists:', restaurant.name);
    }

    // 1. Create Tables
    console.log('Creating 10 tables...');
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      let table = await prisma.table.findFirst({
        where: { number: i, restaurantId: RESTAURANT_ID },
      });
      if (!table) {
        table = await prisma.table.create({
          data: {
            number: i,
            capacity: Math.floor(Math.random() * 4) + 2,
            restaurantId: RESTAURANT_ID,
          },
        });
      }
      tables.push(table);
    }
    console.log(`Created ${tables.length} tables`);

    // 2. Create Menu Items
    console.log('Creating Menu Items...');
    const menuData = [
      { name: 'Margherita Pizza', category: 'Mains', price: 299 },
      { name: 'Pepperoni Pizza', category: 'Mains', price: 399 },
      { name: 'Caesar Salad', category: 'Starters', price: 199 },
      { name: 'Garlic Bread', category: 'Starters', price: 149 },
      { name: 'Coke', category: 'Beverages', price: 60 },
      { name: 'Sprite', category: 'Beverages', price: 60 },
      { name: 'Tiramisu', category: 'Desserts', price: 249 },
      { name: 'Cheesecake', category: 'Desserts', price: 229 },
      { name: 'Pasta Carbonara', category: 'Mains', price: 349 },
      { name: 'Fries', category: 'Sides', price: 99 },
    ];

    const menuItems = [];
    for (const item of menuData) {
      let createdItem = await prisma.menuItem.findFirst({
        where: { name: item.name, restaurantId: RESTAURANT_ID },
      });
      if (!createdItem) {
        createdItem = await prisma.menuItem.create({
          data: {
            ...item,
            imageUrl: '/placeholder.png',
            restaurantId: RESTAURANT_ID,
          },
        });
      }
      menuItems.push(createdItem);
    }
    console.log(`Created ${menuItems.length} menu items`);

    // 3. Create 20 Orders (reduced from 50 for faster testing)
    console.log('Creating 20 orders...');
    const orders = [];
    for (let i = 1; i <= 20; i++) {
      const table = tables[Math.floor(Math.random() * tables.length)];

      const numItems = Math.floor(Math.random() * 4) + 1;
      const orderItemsData = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        orderItemsData.push({
          menuItemId: menuItem.id,
          quantity: quantity,
          price: menuItem.price,
          specialInstructions: Math.random() > 0.8 ? 'No onions' : null,
        });
        totalAmount += menuItem.price * quantity;
      }

      const statuses = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const order = await prisma.order.create({
        data: {
          tableId: table.id,
          customerName: `Customer ${i}`,
          status: status as any,
          totalAmount,
          items: {
            create: orderItemsData,
          },
        },
      });
      orders.push(order);

      // 4. Generate Bills for completed orders
      if (status === 'COMPLETED') {
        const tax = order.totalAmount * 0.18; // 18% GST
        const total = order.totalAmount + tax;

        await prisma.bill.create({
          data: {
            orderId: order.id,
            tableId: table.id,
            subtotal: order.totalAmount,
            tax: tax,
            discount: 0,
            total: total,
            status: Math.random() > 0.3 ? 'PAID' : 'PENDING',
            paymentMethod: 'CASH',
          },
        });
      }
    }

    console.log('Simulation complete! Restaurant is fully loaded with data.');
    console.log(`  - Tables: ${tables.length}`);
    console.log(`  - Menu Items: ${menuItems.length}`);
    console.log(`  - Orders: ${orders.length}`);

    return NextResponse.json({
      message: 'Simulation complete',
      tables: tables.length,
      menuItems: menuItems.length,
      orders: orders.length,
    });
  } catch (error) {
    console.error('Simulation error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
