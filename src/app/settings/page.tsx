'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [restaurantName, setRestaurantName] = useState('Gen-Z Restaurant');
  const [address, setAddress] = useState('123 Main Street, New Delhi, India');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('contact@genz-restaurant.com');
  const [gstNumber, setGstNumber] = useState('07AABCG1234A1Z5');
  const [taxRate, setTaxRate] = useState('18');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const SettingField = ({ label, value, onChange, type = 'text', placeholder }: any) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage restaurant configuration</p>
      </div>

      {/* Restaurant Info */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center text-xl">
            🏪
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Restaurant Information</h2>
            <p className="text-sm text-gray-500">Basic details about your restaurant</p>
          </div>
        </div>

        <div className="space-y-4">
          <SettingField
            label="Restaurant Name"
            value={restaurantName}
            onChange={setRestaurantName}
            placeholder="Enter restaurant name"
          />
          <SettingField
            label="Address"
            value={address}
            onChange={setAddress}
            placeholder="Enter address"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingField
              label="Phone Number"
              value={phone}
              onChange={setPhone}
              placeholder="+91 XXXXX XXXXX"
            />
            <SettingField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="contact@restaurant.com"
            />
          </div>
        </div>
      </Card>

      {/* Tax & Billing */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-xl">
            🧾
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tax & Billing</h2>
            <p className="text-sm text-gray-500">GST and tax configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <SettingField
            label="GST Number"
            value={gstNumber}
            onChange={setGstNumber}
            placeholder="07AABCG1234A1Z5"
          />
          <SettingField
            label="Tax Rate (%)"
            type="number"
            value={taxRate}
            onChange={setTaxRate}
            placeholder="18"
          />
          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            💡 Current tax rate of {taxRate}% will be applied to all bills.CGST and SGST will be split equally.
          </p>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-2 border-red-200 bg-red-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">
            ⚠️
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
            <p className="text-sm text-red-700">Irreversible actions</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
            <div>
              <p className="font-semibold text-gray-900">Clear All Orders</p>
              <p className="text-sm text-gray-500">Delete all order history</p>
            </div>
            <Button variant="destructive" size="sm">
              Clear Orders
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
            <div>
              <p className="font-semibold text-gray-900">Reset Database</p>
              <p className="text-sm text-gray-500">Clear all data and start fresh</p>
            </div>
            <Button variant="destructive" size="sm">
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="gradient"
          size="lg"
          className="min-w-[200px]"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

SettingsPage.displayName = 'SettingsPage';