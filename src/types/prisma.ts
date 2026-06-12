/**
 * Prisma Type Definitions
 * 
 * Properly typed Prisma models and query results to replace `any` types
 * throughout the application. Use these instead of `any[]` for type safety.
 */

import { Prisma } from '@prisma/client';

// ===========================
// Base Models
// ===========================

export type User = Prisma.UserGetPayload<{}>;
export type Restaurant = Prisma.RestaurantGetPayload<{}>;
export type Table = Prisma.TableGetPayload<{}>;
export type MenuItem = Prisma.MenuItemGetPayload<{}>;
export type Order = Prisma.OrderGetPayload<{}>;
export type OrderItem = Prisma.OrderItemGetPayload<{}>;
export type Bill = Prisma.BillGetPayload<{}>;

// ===========================
// Extended Models (with relations)
// ===========================

/**
 * Table with orders
 */
export type TableWithOrders = Prisma.TableGetPayload<{
  include: {
    orders: true;
  };
}>;

/**
 * MenuItem with category and restaurant info
 */
export type MenuItemWithDetails = Prisma.MenuItemGetPayload<{
  include: {
    restaurant: true;
  };
}>;

/**
 * OrderItem with associated MenuItem
 */
export type OrderItemWithMenuItem = Prisma.OrderItemGetPayload<{
  include: {
    menuItem: true;
  };
}>;

/**
 * Order with all related data (table, items with menu items)
 */
export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    table: true;
    orderItems: {
      include: {
        menuItem: true;
      };
    };
  };
}>;

/**
 * Alternative naming for OrderItems (using 'items' field name)
 */
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    table: true;
    items: {
      include: {
        menuItem: true;
      };
    };
  };
}>;

/**
 * Bill with associated order and table
 */
export type BillWithOrder = Prisma.BillGetPayload<{
  include: {
    order: {
      include: {
        table: true;
        items: {
          include: {
            menuItem: true;
          };
        };
      };
    };
  };
}>;

/**
 * Bill with full order details
 */
export type BillWithFullDetails = Prisma.BillGetPayload<{
  include: {
    order: {
      include: {
        table: true;
        orderItems: {
          include: {
            menuItem: true;
          };
        };
      };
    };
    table: true;
  };
}>;

// ===========================
// API Response Types
// ===========================

/**
 * Order list item (for KOT and order pages)
 */
export interface OrderListItem extends OrderWithDetails {
  // Add any computed properties here if needed
}

/**
 * Menu item for display
 */
export interface MenuItemDisplay extends MenuItem {
  // Add any computed properties here if needed
}

/**
 * Bill summary
 */
export interface BillSummary extends Bill {
  orderNumber?: string;
  tableNumber?: number;
}

// ===========================
// Form Input Types
// ===========================

/**
 * Create order input (from frontend)
 */
export interface CreateOrderInput {
  tableId: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
}

/**
 * Create bill input
 */
export interface CreateBillInput {
  orderId: string;
}

/**
 * Update order status input
 */
export interface UpdateOrderStatusInput {
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED';
}

/**
 * Update bill status input
 */
export interface UpdateBillStatusInput {
  status: 'PAID' | 'CANCELLED';
  paymentMethod?: string;
}

// ===========================
// Query Filter Types
// ===========================

/**
 * Order filters
 */
export interface OrderFilters {
  status?: string | string[];
  tableId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Bill filters
 */
export interface BillFilters {
  status?: 'PENDING' | 'PAID';
  startDate?: Date;
  endDate?: Date;
}

/**
 * Menu item filters
 */
export interface MenuItemFilters {
  category?: string;
  available?: boolean;
  search?: string;
}

// ===========================
// Pagination Types
// ===========================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================
// Utility Types
// ===========================

/**
 * Pick specific fields from Prisma model
 */
export type PickModel<T, K extends keyof T> = Pick<T, K>;

/**
 * Omit specific fields from Prisma model
 */
export type OmitModel<T, K extends keyof T> = Omit<T, K>;

/**
 * Make specific fields optional
 */
export type PartialModel<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
