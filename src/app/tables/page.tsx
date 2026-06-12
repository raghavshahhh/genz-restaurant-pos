'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const router = useRouter();

  // Form state for adding table
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [restaurantId, setRestaurantId] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tables');
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      setTables(data);
    } catch (err) {
      setError('Failed to load tables. Please try again.');
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || !capacity || !restaurantId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: parseInt(number),
          capacity: parseInt(capacity),
          restaurantId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create table');
      }

      // Reset form
      setNumber('');
      setCapacity('');
      setRestaurantId('');
      setShowAddModal(false);
      
      // Refresh tables
      await fetchTables();
    } catch (err) {
      setError('Failed to create table. Please try again.');
      console.error('Error creating table:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tables/${tableToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete table');
      }

      setShowDeleteModal(false);
      setTableToDelete(null);
      await fetchTables();
    } catch (err) {
      setError('Failed to delete table. Please try again.');
      console.error('Error deleting table:', err);
    } finally {
      setLoading(false);
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
        <Button onClick={() => { setError(null); fetchTables(); }} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4">
        <h1 className="text-2xl font-bold flex items-center justify-between">
          Tables Management
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white"
          >
            Add Table
          </Button>
        </h1>
        <p className="text-sm text-gray-500">
          View and manage restaurant tables
        </p>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New Table</h2>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label htmlFor="tableNumber" className="mb-2 block font-medium">
                  Table Number
                </label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full"
                  placeholder="Enter table number"
                />
              </div>
              <div>
                <label htmlFor="tableCapacity" className="mb-2 block font-medium">
                  Capacity (Seats)
                </label>
                <Input
                  id="tableCapacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full"
                  placeholder="Enter seat capacity"
                />
              </div>
              <div>
                <label htmlFor="tableRestaurantId" className="mb-2 block font-medium">
                  Restaurant ID
                </label>
                <Input
                  id="tableRestaurantId"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  className="w-full"
                  placeholder="Enter restaurant ID"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white">
                  Add Table
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete this table? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTableToDelete(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteTable}
                className="bg-destructive text-destructive-foreground"
              >
                Delete Table
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tables List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Tables</h2>
        
        {tables.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No tables found. Add your first table to get started.
          </p>
        ) : (
          <div className="divide-y divide-gray-200">
            {tables.map((table) => (
              <div key={table.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-bold">{`Table #${table.number}`}</h3>
                    <p className="text-sm text-gray-500">
                      Capacity: {table.capacity} seats
                    </p>
                    <p className="text-sm text-gray-500">
                      Restaurant: {table.restaurant?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      table.status === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : table.status === 'OCCUPIED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {table.status}
                    </span>
                    <Button
                      onClick={() => {
                        setTableToDelete(table.id);
                        setShowDeleteModal(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

TablesPage.displayName = 'TablesPage';