import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminUsersAPI } from '../../services/api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, thisMonth: 0, thisWeek: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        try {
            const { data } = await adminUsersAPI.getAll({ page, limit: 15, search });
            setUsers(Array.isArray(data?.data) ? data.data : []);
            setTotalPages(data.pagination?.pages || 1);
        } catch (err) {
            toast.error('Failed to load users');
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await adminUsersAPI.getStats();
            setStats(data.data);
        } catch (err) { /* ignore */ }
    };

    useEffect(() => {
        Promise.all([fetchUsers(), fetchStats()]).finally(() => setLoading(false));
    }, [page, search]);

    const handleToggle = async (id) => {
        try {
            const { data } = await adminUsersAPI.toggle(id);
            toast.success(data.message || 'User status updated');
            fetchUsers();
            fetchStats();
        } catch (err) {
            toast.error('Failed to update user');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await adminUsersAPI.delete(id);
            toast.success('User deleted');
            fetchUsers();
            fetchStats();
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold text-gray-900">Users Management</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: stats.total, color: 'primary' },
                    { label: 'Active Users', value: stats.active, color: 'green' },
                    { label: 'This Month', value: stats.thisMonth, color: 'blue' },
                    { label: 'This Week', value: stats.thisWeek, color: 'purple' },
                ].map(s => (
                    <div key={s.label} className="card p-4">
                        <p className="text-gray-500 text-xs">{s.label}</p>
                        <p className={`text-2xl font-bold text-${s.color}-400 mt-1`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="card p-4">
                <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by name, email, phone or city..."
                    className="input-field"
                />
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">User</th>
                                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Phone</th>
                                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">City</th>
                                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Joined</th>
                                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No users found</td></tr>
                            ) : users.map(u => (
                                <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {u.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-gray-900 text-sm font-medium">{u.name}</p>
                                                <p className="text-gray-500 text-xs">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 text-sm">{u.phone || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 text-sm">{u.city || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggle(u._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                            >
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u._id, u.name)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                        >
                            ← Prev
                        </button>
                        <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
