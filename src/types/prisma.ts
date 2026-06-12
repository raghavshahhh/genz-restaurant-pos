import { Order, OrderItem, MenuItem, Table, Bill, User, Restaurant } from '@prisma/client';

export type OrderWithItems = Order & {
  items: (OrderItem & {
    menuItem: MenuItem;
  })[];
  table: Table;
};

export type BillWithRelations = Bill & {
  order: OrderWithItems;
  table: Table;
};

export type MenuItemWithRestaurant = MenuItem & {
  restaurant: Restaurant;
};

export type TableWithRestaurant = Table & {
  restaurant: Restaurant;
};

export type UserWithRestaurant = User & {
  restaurant: Restaurant | null;
};
