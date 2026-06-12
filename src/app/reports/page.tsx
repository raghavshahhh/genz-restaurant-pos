'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ReportsPage() {
  const [reportData, setReportData] = useState({
    dailySalesTotal: 0,
    ordersCount: 0,
    topItems: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, gradient }: any) => (
    <Card className={`p-6 bg-gradient-to-br ${gradient} text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-4xl font-black mt-2">{value}</p>
        </div>
        <div className="text-5xl opacity-80">{icon}</div>
      </div>
    </Card>
  );

  const TopItemCard = ({ item, rank }: any) => (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all bg-white card-hover">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white font-black">
          #{rank}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.quantity} orders • ₹{item.revenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl">🔥</span>
        </div>
      </div>
    </div>
  );

  if (loading && !reportData.dailySalesTotal) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center animate-fade-in">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => { setError(null); fetchReport(); }} variant="gradient">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track your restaurant performance</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Data
        </div>
      </div>

      {/* Date Filter */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center text-xl">
            📅
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Date Range</h2>
            <p className="text-sm text-gray-500">Select period for analysis</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchReport} variant="gradient" className="w-full">
              🔍 Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${reportData.dailySalesTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon="💰"
          gradient="from-violet-600 via-purple-600 to-pink-600"
        />
        <StatCard
          title="Total Orders"
          value={reportData.ordersCount}
          icon="📋"
          gradient="from-orange-500 to-pink-500"
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${reportData.ordersCount > 0 ? Math.round(reportData.dailySalesTotal / reportData.ordersCount) : 0}`}
          icon="📊"
          gradient="from-green-500 to-emerald-600"
        />
      </div>

      {/* Top Items */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Top Performing Items</h2>
            <p className="text-sm text-gray-500">Best sellers by revenue</p>
          </div>
        </div>

        {reportData.topItems.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 mb-4">No sales data for selected period</p>
            <p className="text-sm text-gray-400">Try adjusting your date range</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportData.topItems.map((item: any, index: number) => (
              <TopItemCard key={index} item={item} rank={index + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl">
            💡
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Quick Insights</h2>
            <p className="text-sm text-gray-500">Performance highlights</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <span className="text-sm text-gray-600">Best performing category</span>
            <span className="font-bold text-violet-600">Mains 🔥</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <span className="text-sm text-gray-600">Peak hours</span>
            <span className="font-bold text-pink-600">7-9 PM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <span className="text-sm text-gray-600">Busiest table</span>
            <span className="font-bold text-orange-600">Table #5</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

ReportsPage.displayName = 'ReportsPage';