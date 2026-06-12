'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<{menuItemId: string, quantity: number, specialInstructions: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tablesRes, menuRes, ordersRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/menu'),
        fetch('/api/orders?status=PENDING,PREPARING,READY,SERVED')
      ]);
      
      if (!tablesRes.ok || !menuRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const tablesData = await tablesRes.json();
      const menuData = await menuRes.json();
      const ordersData = await ordersRes.json();
      
      setTables(tablesData);
      setMenuItems(menuData);
      setActiveOrders(ordersData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
      toast.error('Failed to load orders data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (menuItem: any) => {
    const existing = orderItems.find(item => item.menuItemId === menuItem.id);
    if (existing) {
      setOrderItems(orderItems.map(item => 
        item.menuItemId === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setOrderItems([...orderItems, { menuItemId: menuItem.id, quantity: 1, specialInstructions: '' }]);
    }
  };

  const handleRemoveItem = (menuItemId: string) => {
    const existing = orderItems.find(item => item.menuItemId === menuItemId);
    if (existing && existing.quantity > 1) {
      setOrderItems(orderItems.map(item => 
        item.menuItemId === menuItemId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    } else {
      setOrderItems(orderItems.filter(item => item.menuItemId !== menuItemId));
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedTable || orderItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTable,
          items: orderItems
        })
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Reset form
      setSelectedTable(null);
      setOrderItems([]);
      toast.success('Order placed successfully!');
      await fetchData();
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error('Error placing order:', err);
      toast.error('Failed to place order');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      toast.success(`Order status updated to ${status}`);
      await fetchData();
    } catch (err) {
      setError('Failed to update order status. Please try again.');
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemPrice = (id: string) => {
    const item = menuItems.find(m => m.id === id);
    return item ? item.price : 0;
  };

  const getMenuItemName = (id: string) => {
    const item = menuItems.find(m => m.id === id);
    return item ? item.name : 'Unknown';
  };

  const currentTotal = orderItems.reduce((sum, item) => sum + (getMenuItemPrice(item.menuItemId) * item.quantity), 0);

  if (loading && tables.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="w-2/3 space-y-4">
            <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="w-1/3">
            <div className="h-[600px] bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => { setError(null); fetchData(); }} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4">
        <h1 className="text-2xl font-bold">Take Order</h1>
        <p className="text-sm text-gray-500">
          Create new orders and manage active ones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">1. Select Table</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {tables.map(table => (
                <Button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  variant={selectedTable === table.id ? "outline" : "outline"}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    selectedTable === table.id
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 hover:border-primary/50 text-gray-700'
                  }`}
                >
                  <span className="block font-bold">T{table.number}</span>
                  <span className="text-xs opacity-80">{table.capacity} pax</span>
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">2. Select Items</h2>
            {menuItems.length === 0 ? (
              <p className="text-gray-500">No available menu items found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {menuItems.map(item => (
                  <Button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    variant="outline"
                    className="p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 text-left transition-colors flex flex-col h-full justify-between"
                  >
                    <div>
                      <span className="block font-medium line-clamp-2 leading-tight">{item.name}</span>
                      <span className="text-xs text-gray-500 mt-1 block">{item.category}</span>
                    </div>
                    <span className="block font-bold text-primary mt-2">₹{item.price}</span>
                  </Button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4 flex flex-col h-[500px]">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Current Order</h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {orderItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Select items to build order</p>
              ) : (
                orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-medium truncate">{getMenuItemName(item.menuItemId)}</p>
                      <p className="text-sm text-gray-500 mb-1">₹{getMenuItemPrice(item.menuItemId)} x {item.quantity}</p>
                      <Input
                        placeholder="Special instructions (optional)"
                        value={item.specialInstructions || ''}
                        onChange={(e) => {
                          const newOrderItems = [...orderItems];
                          newOrderItems[index].specialInstructions = e.target.value;
                          setOrderItems(newOrderItems);
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleRemoveItem(item.menuItemId)} className="h-7 w-7 p-0">
                        -
                      </Button>
                      <span className="w-4 text-center font-medium">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => handleAddItem({id: item.menuItemId})} className="h-7 w-7 p-0">
                        +
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t mt-4">
              <div className="flex justify-between mb-4">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-lg text-primary">₹{currentTotal.toFixed(2)}</span>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedTable || orderItems.length === 0 || isSubmitting}
                className="w-full bg-primary text-white py-6 text-lg"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </Button>
              {!selectedTable && orderItems.length > 0 && (
                <p className="text-red-500 text-sm text-center mt-2">Please select a table first</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
        {activeOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active orders</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <h3 className="font-bold text-lg">Table {order.table.number}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' : order.status === 'READY' ? 'bg-green-100 text-green-800' : order.status === 'SERVED' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex-1 mb-4 text-sm space-y-1">
                  {order.items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate pr-2">{item.quantity}x {item.menuItem.name}</span>
                      <span className="text-gray-500">₹{(item.quantity * item.menuItem.price).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-gray-500 italic">+ {order.items.length - 3} more items</div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-auto pt-3 border-t">
                  <span className="font-bold text-primary">₹{order.totalAmount}</span>
                  {order.status === 'READY' && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.id, 'SERVED')}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Serve
                    </Button>
                  )}
                  {order.status === 'SERVED' && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

OrdersPage.displayName = 'OrdersPage';