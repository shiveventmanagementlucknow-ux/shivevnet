import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { bookingAPI } from '../../services/api';

const STATUS_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-400/30',
  confirmed: 'text-green-600 bg-green-50 border-green-400/30',
  cancelled: 'text-red-600 bg-red-50 border-red-400/30',
  completed: 'text-blue-600 bg-blue-50 border-blue-400/30',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await bookingAPI.getAll({ page, limit: 12, search, status: statusFilter });
      setBookings(Array.isArray(res.data?.data) ? res.data.data : []);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchBookings(1); }, [fetchBookings]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(true);
    try {
      await bookingAPI.update(id, { status });
      toast.success('Status updated');
      setSelected(prev => prev ? { ...prev, status } : null);
      fetchBookings(pagination.page);
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    try {
      await bookingAPI.delete(id);
      toast.success('Booking deleted');
      setSelected(null);
      fetchBookings(pagination.page);
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <>
      <Helmet><title>Bookings – Shiv Event Management Admin</title></Helmet>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm">{pagination.total} total bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, email…"
          className="input-field flex-1 max-w-sm"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-40">
          <option value="">All Status</option>
          {['pending', 'confirmed', 'cancelled', 'completed'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Client', 'Event Type', 'Date', 'Budget', 'Status', 'Booked On', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-gray-500 text-xs uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : bookings.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-500">No bookings found</td></tr>
            ) : bookings.map(b => (
              <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">{b.name}</div>
                  <div className="text-gray-500 text-xs">{b.phone}</div>
                </td>
                <td className="px-5 py-4 text-gray-600">{b.eventType}</td>
                <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{new Date(b.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                <td className="px-5 py-4 text-gray-600">{b.budget ? `₹${b.budget.toLocaleString('en-IN')}` : '—'}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[b.status] || ''}`}>{b.status}</span>
                </td>
                <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}</td>
                <td className="px-5 py-4">
                  <button onClick={() => setSelected(b)} className="text-primary-600 hover:text-primary-300 text-xs underline underline-offset-2">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchBookings(pagination.page - 1)}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40">← Prev</button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchBookings(pagination.page + 1)}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="card max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900">{selected.name}</h2>
                <p className="text-gray-500 text-sm">{selected.email} · {selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-900 text-2xl leading-none">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              {[
                ['Event Type', selected.eventType],
                ['Date', new Date(selected.date).toLocaleDateString('en-IN', { dateStyle: 'long' })],
                ['Budget', selected.budget ? `₹${selected.budget.toLocaleString('en-IN')}` : '—'],
                ['Payment', selected.paymentStatus],
                ['Booked', new Date(selected.createdAt).toLocaleDateString('en-IN')],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-100 rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">{k}</div>
                  <div className="text-gray-900 font-medium">{v}</div>
                </div>
              ))}
            </div>

            {selected.message && (
              <div className="bg-gray-100 rounded-xl p-4 mb-5 text-sm">
                <p className="text-gray-500 text-xs mb-1">Message</p>
                <p className="text-gray-200">{selected.message}</p>
              </div>
            )}

            {/* Status Update */}
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-2">Update Status</label>
              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'cancelled', 'completed'].map(s => (
                  <button key={s} disabled={updating || selected.status === s}
                    onClick={() => handleStatusUpdate(selected._id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected.status === s
                      ? `${STATUS_COLORS[s]} border-current`
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'
                      }`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => handleDelete(selected._id)}
              className="w-full py-2 rounded-xl text-sm text-red-600 border border-red-500/30 hover:bg-red-50 transition-all">
              🗑 Delete Booking
            </button>
          </div>
        </div>
      )}
    </>
  );
}
