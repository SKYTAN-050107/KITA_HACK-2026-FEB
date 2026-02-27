import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Plus, Settings, TrendingUp, PieChart, Users,
  DollarSign, Package, Clock, Bell, BarChart3, Target,
} from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';

/**
 * EnterpriseDashboard.jsx
 *
 * Separate dashboard for enterprise / institutional buyers.
 * Features: Buyer requests, suppliers, custom pricing, analytics.
 * Adapted to project's emerald / glassmorphism / dark-mode design.
 */

const EnterpriseDashboard = () => {
  const navigate = useNavigate();
  const [darkMode] = useDarkMode();
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Mock data (unchanged) ────────────────────────────────────── */

  const mockUser = JSON.parse(localStorage.getItem('mockUser')) || {
    displayName: 'Demo Manufacturing',
    email: 'company@demo.com',
    companyName: 'Demo Manufacturing Inc.',
  };

  const stats = {
    activeRequests: 5,
    connectedSuppliers: 23,
    totalSpending: 12450,
    averagePrice: 18.5,
    pendingOrders: 8,
    completedDeals: 156,
  };

  const pricingTiers = [
    {
      id: 1, name: 'Standard', basePrice: 20, minQuantity: '1-99kg',
      discount: '0%', features: ['Regular delivery', 'Email support', 'Basic reporting'], active: true,
    },
    {
      id: 2, name: 'Bulk', basePrice: 15, minQuantity: '100-499kg',
      discount: '25%', features: ['Priority delivery', 'Phone support', 'Weekly reports', 'Volume tracking'], active: true,
    },
    {
      id: 3, name: 'Premium', basePrice: 12, minQuantity: '500kg+',
      discount: '40%', features: ['Express delivery', '24/7 support', 'Custom analytics', 'Dedicated account manager'], active: true,
    },
  ];

  const activeRequests = [
    { id: 1, wasteType: 'Plastic Bottles (PET)', quantity: 500, unit: 'kg', budget: '$9,500', posted: '2 days ago', responses: 12, status: 'Active' },
    { id: 2, wasteType: 'Aluminum Cans', quantity: 2000, unit: 'kg', budget: '$32,000', posted: '5 days ago', responses: 28, status: 'Active' },
    { id: 3, wasteType: 'Paper & Cardboard', quantity: 1000, unit: 'kg', budget: '$5,000', posted: '1 week ago', responses: 15, status: 'Pending Fulfillment' },
  ];

  const monthlySpending = [
    { month: 'Jan', spent: 1200, orders: 4 },
    { month: 'Feb', spent: 1800, orders: 5 },
    { month: 'Mar', spent: 2200, orders: 7 },
    { month: 'Apr', spent: 2100, orders: 6 },
    { month: 'May', spent: 2950, orders: 8 },
    { month: 'Jun', spent: 2200, orders: 6 },
  ];

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleLogout = () => {
    localStorage.removeItem('mockUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    navigate('/');
  };

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-extrabold tracking-tight text-primary hover:text-emerald-500 flex items-center gap-2 transition-colors"
            >
              <Package className="w-8 h-8" />
              KITA_HACK
            </button>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
              Enterprise
            </span>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { key: 'overview', label: 'Overview', Icon: BarChart3 },
              { key: 'pricing', label: 'Pricing Tiers', Icon: DollarSign },
              { key: 'analytics', label: 'Analytics', Icon: PieChart },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  activeTab === key
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-200 dark:bg-emerald-800 rounded-full flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {mockUser.displayName.charAt(0)}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mockUser.displayName}
                </span>
              </button>

              {/* Dropdown */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-xl shadow-lg border border-white/40 dark:border-white/10 py-2 z-30">
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
              Welcome, {mockUser.companyName}! 🏢
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your bulk waste procurement and supplier relationships.
            </p>
          </div>
          <button
            onClick={() => alert('Mock: Post a new buyer request form would open')}
            className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-400 text-white font-extrabold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Post Buyer Request
          </button>
        </div>

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              {/* Active Requests */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Requests</p>
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.activeRequests}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Looking for suppliers</p>
              </div>

              {/* Connected Suppliers */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suppliers</p>
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.connectedSuppliers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Verified connections</p>
              </div>

              {/* Total Spending */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spending</p>
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">${stats.totalSpending}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">This month (estimated)</p>
              </div>

              {/* Average Price */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Price/kg</p>
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">${stats.averagePrice}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Across all purchases</p>
              </div>

              {/* Pending Orders */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.pendingOrders}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Awaiting fulfillment</p>
              </div>

              {/* Completed Deals — accent gradient card */}
              <div className="bg-gradient-to-br from-primary to-emerald-400 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-emerald-100">Completed Deals</p>
                  <BarChart3 className="w-5 h-5 text-emerald-100" />
                </div>
                <p className="text-3xl font-extrabold">{stats.completedDeals}</p>
                <p className="text-xs text-emerald-100 mt-2">Successful transactions</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { Icon: Users, color: 'text-emerald-600 dark:text-emerald-400', title: 'Find Suppliers', desc: 'Search and connect with waste suppliers', action: () => alert('Mock: Bulk supplier search form') },
                { Icon: DollarSign, color: 'text-green-600 dark:text-green-400', title: 'Manage Pricing', desc: 'Set volume discounts and pricing tiers', action: () => alert('Mock: Custom pricing management panel') },
                { Icon: Package, color: 'text-purple-600 dark:text-purple-400', title: 'Manage Inventory', desc: 'Track stock and fulfillment status', action: () => alert('Mock: Inventory management and tracking') },
                { Icon: PieChart, color: 'text-indigo-600 dark:text-indigo-400', title: 'View Analytics', desc: 'Advanced spending and performance reports', action: () => setActiveTab('analytics') },
              ].map(({ Icon, color, title, desc, action }) => (
                <button
                  key={title}
                  onClick={action}
                  className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 hover:shadow-lg transition text-left"
                >
                  <Icon className={`w-8 h-8 ${color} mb-3`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                </button>
              ))}
            </div>

            {/* Active Requests */}
            <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                Active Buyer Requests
              </h2>

              <div className="space-y-4">
                {activeRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:shadow-md transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{request.wasteType}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.quantity} {request.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{request.budget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Responses</p>
                        <p className="font-semibold text-primary">{request.responses} offers</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Posted</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{request.posted}</p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'Active'
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                          }`}
                        >
                          {request.status}
                        </span>
                        <button className="text-primary hover:underline text-sm font-medium">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════════ PRICING TIERS TAB ═══════════ */}
        {activeTab === 'pricing' && (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
              Custom Pricing Tiers
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Set up different pricing tiers based on volume. Suppliers can choose
              the tier that matches their business.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-xl border-2 p-6 backdrop-blur-xl transition-colors ${
                    tier.id === 2
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/20'
                      : 'border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/10'
                  }`}
                >
                  {tier.id === 2 && (
                    <div className="mb-4 inline-block bg-gradient-to-r from-primary to-emerald-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      RECOMMENDED
                    </div>
                  )}
                  <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                    {tier.name}
                  </h3>
                  <div className="mb-4">
                    <p className="text-4xl font-extrabold text-primary">${tier.basePrice}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">/kg (base price)</p>
                  </div>

                  <div className="bg-gray-100 dark:bg-white/5 rounded-xl p-3 mb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Minimum: {tier.minQuantity}
                    </p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Discount: {tier.discount}
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => alert(`Mock: Edit ${tier.name} pricing tier`)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-primary to-emerald-400 text-white font-semibold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition"
                  >
                    Edit Tier
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 transition-colors">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                💡 Pricing Tips
              </h3>
              <ul className="text-sm text-emerald-900 dark:text-emerald-100 space-y-2">
                <li>• Set competitive prices to attract more suppliers</li>
                <li>• Bulk discounts encourage larger order quantities</li>
                <li>• Monitor market rates and adjust tiers monthly</li>
                <li>• Premium tier should include exclusive benefits</li>
              </ul>
            </div>
          </div>
        )}

        {/* ═══════════ ANALYTICS TAB ═══════════ */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
              Advanced Analytics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Spending Chart */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Spending</h3>
                <div className="space-y-3">
                  {monthlySpending.map((data) => (
                    <div key={data.month} className="flex items-center gap-4">
                      <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {data.month}
                      </div>
                      <div className="flex-1 bg-gray-200 dark:bg-white/10 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${(data.spent / 3000) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">${data.spent}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{data.orders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplier Distribution */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Supplier Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Verified (20)
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pending (3)
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">13%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3">
                      <div className="bg-yellow-600 h-3 rounded-full" style={{ width: '13%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Waste Types */}
            <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Top Purchased Waste Types
              </h3>
              <div className="space-y-4">
                {[
                  { type: 'Plastic Bottles', qty: 2400, spend: 4200 },
                  { type: 'Aluminum Cans', qty: 1800, spend: 3600 },
                  { type: 'Paper & Cardboard', qty: 1200, spend: 2400 },
                  { type: 'Metal Scraps', qty: 800, spend: 1600 },
                ].map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.qty} kg purchased</p>
                    </div>
                    <p className="font-bold text-primary">${item.spend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EnterpriseDashboard;
