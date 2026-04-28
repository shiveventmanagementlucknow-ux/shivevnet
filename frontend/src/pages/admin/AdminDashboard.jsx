import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { bookingAPI, contactAPI, adminUsersAPI } from '../../services/api';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="card p-6 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-900 text-2xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  </div>
);

const STATUS_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50',
  confirmed: 'text-green-600 bg-green-50',
  cancelled: 'text-red-600 bg-red-50',
  completed: 'text-blue-600 bg-blue-50',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userStats, setUserStats] = useState({ total: 0, active: 0, thisMonth: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      bookingAPI.getStats(),
      bookingAPI.getAll({ limit: 5, page: 1 }),
      contactAPI.getAll({ isRead: false, limit: 1 }),
      adminUsersAPI.getStats(),
      adminUsersAPI.getAll({ page: 1, limit: 5 }),
    ]).then(([statsRes, bookingsRes, contactsRes, uStatsRes, uListRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || {});
      if (bookingsRes.status === 'fulfilled') setBookings(Array.isArray(bookingsRes.value.data?.data) ? bookingsRes.value.data.data : []);
      if (contactsRes.status === 'fulfilled') setUnreadCount(contactsRes.value.data.pagination?.total || 0);
      if (uStatsRes.status === 'fulfilled') setUserStats(uStatsRes.value.data?.data || { total: 0, active: 0, thisMonth: 0 });
      if (uListRes.status === 'fulfilled') setRecentUsers(Array.isArray(uListRes.value.data?.data) ? uListRes.value.data.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const chartData = stats?.stats?.map(s => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    Bookings: s.count,
    Budget: Math.round((s.totalBudget || 0) / 1000),
  })) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Helmet><title>Dashboard – Shiv Event Management Admin</title></Helmet>

      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <StatCard icon="📅" label="Total Bookings" value={stats?.total || 0} sub="All time" color="bg-primary-500/15" />
        <StatCard icon="🆕" label="This Month" value={stats?.thisMonth || 0} sub="New bookings" color="bg-green-500/15" />
        <StatCard icon="⏳" label="Pending" value={stats?.stats?.find(s => s._id === 'pending')?.count || 0} sub="Awaiting confirmation" color="bg-yellow-500/15" />
        <StatCard icon="✉️" label="Unread Messages" value={unreadCount} sub="Contact inquiries" color="bg-purple-500/15" />
        <StatCard icon="👥" label="Registered Users" value={userStats.total} sub={`${userStats.thisMonth} this month`} color="bg-blue-500/15" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 card p-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-5">Bookings by Status</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #6366f1', borderRadius: 8, color: '#fff' }}
                  cursor={{ fill: '#6366f120' }}
                />
                <Bar dataKey="Bookings" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-500">No booking data yet</div>
          )}
        </div>

        {/* Quick Links */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-5">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/admin/bookings', icon: '📅', label: 'View All Bookings', color: 'hover:border-primary-500/40' },
              { to: '/admin/contacts', icon: '✉️', label: 'Read Messages', color: 'hover:border-purple-500/40' },
              { to: '/admin/blogs', icon: '📝', label: 'Manage Blog', color: 'hover:border-green-500/40' },
              { to: '/admin/gallery', icon: '🖼️', label: 'Upload Photos', color: 'hover:border-yellow-500/40' },
              { to: '/admin/services', icon: '🎯', label: 'Edit Services', color: 'hover:border-blue-500/40' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 ${item.color} hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-sm transition-all`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card mt-6">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-display text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-primary-600 text-sm hover:text-primary-300">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100">
                {['Name', 'Event', 'Date', 'Status', 'Budget'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-gray-500 text-xs uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No bookings yet</td></tr>
              ) : bookings.map(b => (
                <tr key={b._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{b.name}</td>
                  <td className="px-6 py-4 text-gray-600">{b.eventType}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(b.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || 'text-gray-500 bg-gray-50'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{b.budget ? `₹${b.budget.toLocaleString('en-IN')}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Recent Users */}
      <div className="card mt-6">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-display text-lg font-semibold text-gray-900">Recent Users</h2>
          <Link to="/admin/users" className="text-primary-600 text-sm hover:text-primary-300">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100">
                {['Name', 'Email', 'Phone', 'City', 'Joined'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-gray-500 text-xs uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users yet</td></tr>
              ) : recentUsers.map(u => (
                <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-gray-600">{u.phone || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{u.city || '—'}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
