'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { OrderWithItems } from '@/types/prisma';

export default function KOTPage() {
  const [orders, setOrders] = useState<Record<number, OrderWithItems[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKOTOrders();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(fetchKOTOrders, 5000); // Poll every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchKOTOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders?status=PENDING,PREPARING,READY');
      if (!response.ok) {
        throw new Error('Failed to fetch KOT orders');
      }
      const data: OrderWithItems[] = await response.json();
      
      // Group orders by table for KOT display
      const groupedOrders = data.reduce((acc: Record<number, OrderWithItems[]>, order) => {
        const tableNumber = order.table?.number || 0;
        if (!acc[tableNumber]) {
          acc[tableNumber] = [];
        }
        acc[tableNumber].push(order);
        return acc;
      }, {});
      
      setOrders(groupedOrders);
    } catch (err) {
      setError('Failed to load KOT orders. Please try again.');
      console.error('Error fetching KOT orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders after update
      await fetchKOTOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-12 w-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => { setError(null); fetchKOTOrders(); }} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Convert grouped orders to array for rendering
  const orderGroups = Object.entries(orders);

  return (
    <div className="space-y-6">
      <div className="pb-4">
        <h1 className="text-2xl font-bold">Kitchen Order Ticket (KOT)</h1>
        <p className="text-sm text-gray-500">
          Active orders grouped by table for kitchen staff
          <span className="ml-2 text-xs text-gray-400">(Auto-refreshes every 5s)</span>
        </p>
      </div>

      {orderGroups.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          No active orders in the kitchen
        </p>
      ) : (
        <div className="space-y-6">
          {orderGroups.map(([tableNumber, tableOrders]) => (
            <Card key={tableNumber} className="p-6">
              <h2 className="text-xl font-semibold mb-4">Table #{tableNumber}</h2>

              {tableOrders.map((order: OrderWithItems) => (
                <div key={order.id} className="border-b pb-4 mb-4 last:mb-0 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-1 bg-gray-50 px-3 rounded">
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="flex-1">
                          {item.menuItem.name}
                          {item.specialInstructions && (
                            <span className="text-xs text-gray-500 ml-1">({item.specialInstructions})</span>
                          )}
                        </span>
                        <span className="text-right font-medium">₹{(item.quantity * item.menuItem.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-right">
                    <span className="font-bold text-lg">₹{order.totalAmount}</span>
                  </div>

                  {/* Action buttons for kitchen staff */}
                  <div className="mt-4 flex gap-2 justify-end">
                    {order.status === 'PENDING' && (
                      <Button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        variant="default"
                        size="sm"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'PREPARING' && (
                      <Button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark as Ready
                      </Button>
                    )}
                    {order.status === 'READY' && (
                      <Button
                        onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                        variant="outline"
                        size="sm"
                      >
                        Mark as Served
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {tableOrders.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500 text-center">
                    Total items: {tableOrders.reduce((sum, order) => sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0)}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

KOTPage.displayName = 'KOTPage';