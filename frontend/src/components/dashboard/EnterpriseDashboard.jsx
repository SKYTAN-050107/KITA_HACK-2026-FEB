import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDarkMode from '../../hooks/useDarkMode';

/**
 * EnterpriseDashboard.jsx
 *
 * Separate dashboard for enterprise / institutional buyers.
 * Features: Buyer requests, suppliers, analytics.
 * Adapted to project's emerald / glassmorphism / dark-mode design.
 */

const EnterpriseDashboard = ({ tab = 'overview' }) => {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const activeTab = tab;

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

  const activeRequests = [
    { id: 1, wasteType: 'Plastic Bottles (PET)', quantity: 500, unit: 'kg', budget: 'RM9,500', posted: '2 days ago', responses: 12, status: 'Active' },
    { id: 2, wasteType: 'Aluminum Cans', quantity: 2000, unit: 'kg', budget: 'RM32,000', posted: '5 days ago', responses: 28, status: 'Active' },
    { id: 3, wasteType: 'Paper & Cardboard', quantity: 1000, unit: 'kg', budget: 'RM5,000', posted: '1 week ago', responses: 15, status: 'Pending Fulfillment' },
  ];

  const monthlySpending = [
    { month: 'Jan', spent: 1200, orders: 4 },
    { month: 'Feb', spent: 1800, orders: 5 },
    { month: 'Mar', spent: 2200, orders: 7 },
    { month: 'Apr', spent: 2100, orders: 6 },
    { month: 'May', spent: 2950, orders: 8 },
    { month: 'Jun', spent: 2200, orders: 6 },
  ];

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ── Header — matching Dashboard.jsx ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950 dark:text-white mb-1 tracking-tight transition-colors duration-500">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-primary dark:from-emerald-400 dark:to-primary">{mockUser.companyName}</span> 🏢
          </h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">
            Manage your bulk waste procurement and supplier relationships.
          </p>
        </div>
      </div>

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
              {/* Active Requests */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-4 sm:p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active Requests</p>
                  <span className="material-icons-round text-lg sm:text-xl text-emerald-600 dark:text-emerald-400">track_changes</span>
                </div>
                <p className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stats.activeRequests}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2 hidden sm:block">Looking for suppliers</p>
              </div>

              {/* Connected Suppliers */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-4 sm:p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Suppliers</p>
                  <span className="material-icons-round text-lg sm:text-xl text-green-600 dark:text-green-400">group</span>
                </div>
                <p className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stats.connectedSuppliers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2 hidden sm:block">Verified connections</p>
              </div>

              {/* Total Spending */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-4 sm:p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Spending</p>
                  <span className="material-icons-round text-lg sm:text-xl text-purple-600 dark:text-purple-400">attach_money</span>
                </div>
                <p className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">RM{stats.totalSpending}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2 hidden sm:block">This month (estimated)</p>
              </div>

              {/* Average Price */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-4 sm:p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Avg Price/kg</p>
                  <span className="material-icons-round text-lg sm:text-xl text-orange-600 dark:text-orange-400">trending_up</span>
                </div>
                <p className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">RM{stats.averagePrice}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2 hidden sm:block">Across all purchases</p>
              </div>

              {/* Pending Orders */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-4 sm:p-6 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                  <span className="material-icons-round text-lg sm:text-xl text-yellow-600 dark:text-yellow-400">schedule</span>
                </div>
                <p className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stats.pendingOrders}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2 hidden sm:block">Awaiting fulfillment</p>
              </div>

              {/* Completed Deals — accent gradient card */}
              <div className="bg-gradient-to-br from-primary to-emerald-400 rounded-xl p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-emerald-100">Completed Deals</p>
                  <span className="material-icons-round text-lg sm:text-xl text-emerald-100">bar_chart</span>
                </div>
                <p className="text-xl sm:text-3xl font-extrabold">{stats.completedDeals}</p>
                <p className="text-xs text-emerald-100 mt-1 sm:mt-2 hidden sm:block">Successful transactions</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
              {[
                { icon: 'group', color: 'text-emerald-600 dark:text-emerald-400', title: 'Find Suppliers', desc: 'Search and connect with waste suppliers', action: () => navigate('/dashboard/enterprise/marketplace') },
                { icon: 'inventory_2', color: 'text-purple-600 dark:text-purple-400', title: 'Manage Inventory', desc: 'Track stock and fulfillment status', action: () => alert('Mock: Inventory management and tracking') },
                { icon: 'pie_chart', color: 'text-indigo-600 dark:text-indigo-400', title: 'View Analytics', desc: 'Advanced spending and performance reports', action: () => navigate('/dashboard/enterprise/analytics') },
              ].map(({ icon, color, title, desc, action }) => (
                <button
                  key={title}
                  onClick={action}
                  className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-4 sm:p-6 hover:shadow-lg transition text-left"
                >
                  <span className={`material-icons-round text-2xl sm:text-3xl ${color} mb-2 sm:mb-3 block`}>{icon}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">{title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">{desc}</p>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 items-center">
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
                        <p className="font-semibold text-gray-900 dark:text-white">RM{data.spent}</p>
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
                    <p className="font-bold text-primary">RM{item.spend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </motion.div>
  );
};

export default EnterpriseDashboard;
