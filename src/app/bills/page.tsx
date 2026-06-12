'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bills');
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      const json = await response.json();
      // API wraps response in { success: true, data: [...] }
      const billsData = json.data ?? json;
      setBills(Array.isArray(billsData) ? billsData : []);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
      toast.error('Failed to load bills data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate bill');
      }

      setShowGenerateModal(false);
      toast.success('Bill generated successfully!');
      await fetchBills();
    } catch (err) {
      setError('Failed to generate bill. Please try again.');
      console.error('Error generating bill:', err);
      toast.error('Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (billId: string, paymentMethod: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'PAID',
          paymentMethod 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update bill status');
      }

      toast.success('Payment recorded successfully!');
      setShowBillModal(false);
      setSelectedBill(null);
      await fetchBills();
    } catch (err) {
      setError('Failed to update bill status. Please try again.');
      console.error('Error updating bill status:', err);
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBill = () => {
    if (selectedBill) {
      const printContents = document.getElementById('print-receipt')?.innerHTML;
      if (printContents) {
        const printWindow = window.open('', '', 'height=800,width=600');
        if (printWindow) {
          printWindow.document.write(`
            <html><head><title>Bill Receipt</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              .receipt { max-width: 400px; margin: 0 auto; }
              .text-center { text-align: center; }
              .border-t { border-top: 1px dashed #000; }
              .border-b { border-bottom: 1px dashed #000; }
              .flex { display: flex; justify-content: space-between; }
              .font-bold { font-weight: bold; }
              .mt-4 { margin-top: 16px; }
            </style>
            </head><body onload="window.print(); window.close();">
            <div class="receipt">${printContents}</div>
            </body></html>
          `);
          printWindow.document.close();
        }
      }
    }
  };

  if (loading && bills.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-1/4 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => { setError(null); fetchBills(); }} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Find completed orders without bills for the quick generate button
  const completedOrdersWithoutBills = bills
    .map(bill => bill.order)
    .filter((order: any) => order && order.status === 'COMPLETED' && !bills.some((bill: any) => bill.orderId === order.id));

  return (
    <div className="space-y-6">
      <div className="pb-4">
        <h1 className="text-2xl font-bold flex items-center justify-between">
          Bills & Payments
          <Button
            onClick={() => setShowGenerateModal(true)}
            disabled={completedOrdersWithoutBills.length === 0}
            className="bg-primary text-white"
          >
            Generate Bill
          </Button>
        </h1>
        <p className="text-sm text-gray-500">
          Generate and manage bills for completed orders
        </p>
      </div>

      {/* Generate Bill Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Select Order to Bill</h2>
              <Button
                onClick={() => setShowGenerateModal(false)}
                variant="outline"
                size="sm"
                className="text-gray-500"
              >
                Close
              </Button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3">
              {completedOrdersWithoutBills.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No unbilled completed orders.</p>
              ) : (
                completedOrdersWithoutBills.map((order: any) => (
                  <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">Table {order.table?.number || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500">
                        {order.customerName || 'Walk-in'} • ₹{order.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleGenerateBill(order.id)}
                      className="bg-primary text-white"
                    >
                      Generate
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {showBillModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Bill #{selectedBill.id}</h2>
              <Button
                onClick={() => setShowBillModal(false)}
                variant="outline"
                className="text-gray-500 hover:bg-gray-100"
              >
                Close
              </Button>
            </div>

            <div id="print-receipt" className="mb-6 p-4 bg-gray-50 rounded border border-gray-200 text-sm font-mono max-w-sm mx-auto print:bg-white print:border-none print:w-full print:max-w-full print:p-0">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold uppercase mb-1">Gen-Z Restaurant</h2>
                <p className="text-xs">123 Main St</p>
                <p className="text-xs">Tel: (555) 123-4567</p>
              </div>
              
              <div className="border-t border-b border-dashed border-gray-400 py-2 mb-4 text-xs space-y-1">
                <p><span className="font-semibold">Order #:</span> {selectedBill.order.id}</p>
                <p><span className="font-semibold">Date:</span> {new Date(selectedBill.order.createdAt).toLocaleString()}</p>
                <p><span className="font-semibold">Table:</span> {selectedBill.order.table.number}  |  <span className="font-semibold">Customer:</span> {selectedBill.order.customerName || 'Walk-in'}</p>
              </div>

              <div className="mb-4">
                <div className="flex justify-between font-semibold border-b border-gray-300 pb-1 mb-2 text-xs">
                  <span>ITEM</span>
                  <span>AMT</span>
                </div>
                <div className="space-y-2">
                  {selectedBill.order.items.map((item: any) => (
                    <div key={item.id} className="text-xs">
                      <div className="flex justify-between">
                        <span>{item.quantity}x {item.menuItem.name}</span>
                        <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                      {item.specialInstructions && (
                        <div className="text-gray-500 ml-4 italic">- {item.specialInstructions}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{selectedBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span>₹{selectedBill.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-gray-300">
                  <span>TOTAL</span>
                  <span>₹{selectedBill.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedBill.status === 'PAID' && (
                <div className="mt-6 text-center text-xs font-bold border-t border-b border-gray-400 py-2">
                  PAID VIA {selectedBill.paymentMethod || 'CASH'}
                </div>
              )}

              <div className="text-center mt-6 text-xs italic">
                Thank you for dining with us!
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Payment Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status:</p>
                  <p className={`text-lg font-medium
                    ${selectedBill.status === 'PENDING' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}
                  </p>
                </div>
                {selectedBill.status === 'PAID' && (
                  <div>
                    <p className="text-sm text-gray-500">Payment Method:</p>
                    <p className="text-lg font-medium">{selectedBill.paymentMethod || 'Not specified'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {selectedBill.status === 'PENDING' && (
                <>
                  <Button
                    onClick={() => {
                      // In a real app, this would integrate with payment gateway
                      const paymentMethod = prompt('Enter payment method (cash, card, UPI, etc.)') || 'cash';
                      handleMarkPaid(selectedBill.id, paymentMethod);
                    }}
                    variant="outline"
                  >
                    Mark as Paid
                  </Button>
                  <Button
                    onClick={handlePrintBill}
                    className="bg-primary text-white"
                  >
                    Print Bill
                  </Button>
                </>
              )}

              {selectedBill.status === 'PAID' && (
                <Button
                  onClick={handlePrintBill}
                  className="bg-primary text-white"
                >
                  Re-print Bill
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bills List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Bill History</h2>

        {bills.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No bills generated yet. Complete some orders to generate bills.
          </p>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">Bill #{bill.id}</h3>
                    <p className="text-sm text-gray-500">
                      Order #{bill.order.id} • Table #{bill.order.table.number} •
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full
                      ${bill.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}`}>
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                    {bill.status === 'PAID' && (
                      <Button
                        onClick={() => handlePrintBill()}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        Print
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-lg font-medium text-right">
                    Amount: ₹{bill.total.toFixed(2)}
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

BillsPage.displayName = 'BillsPage';