import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { contactAPI } from '../../services/api';

export default function AdminContacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await contactAPI.getAll({ limit: 50 });
            setContacts(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch { toast.error('Failed to load messages'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const markRead = async (id) => {
        await contactAPI.markRead(id).catch(() => { });
        setContacts(c => c.map(x => x._id === id ? { ...x, isRead: true } : x));
        if (selected?._id === id) setSelected(s => ({ ...s, isRead: true }));
    };

    const del = async (id) => {
        if (!confirm('Delete this message?')) return;
        await contactAPI.delete(id);
        toast.success('Deleted');
        setContacts(c => c.filter(x => x._id !== id));
        setSelected(null);
    };

    const openContact = (c) => {
        setSelected(c);
        if (!c.isRead) markRead(c._id);
    };

    return (
        <>
            <Helmet><title>Messages – Shiv Event Management Admin</title></Helmet>
            <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-500 text-sm">{contacts.filter(c => !c.isRead).length} unread</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
                    ) : contacts.length === 0 ? (
                        <p className="p-8 text-center text-gray-500">No messages yet</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {contacts.map(c => (
                                <li key={c._id} onClick={() => openContact(c)}
                                    className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?._id === c._id ? 'bg-primary-500/5 border-l-2 border-primary-500' : ''}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-medium text-sm ${c.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{c.name}</span>
                                                {!c.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                                            </div>
                                            <p className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">{c.subject || c.message.slice(0, 60)}</p>
                                        </div>
                                        <span className="text-gray-600 text-xs whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {selected ? (
                    <div className="card p-7">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h2 className="font-display text-xl font-bold text-gray-900">{selected.name}</h2>
                                <p className="text-gray-500 text-sm">{selected.email}{selected.phone ? ` · ${selected.phone}` : ''}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
                        </div>
                        {selected.subject && <p className="text-primary-600 text-sm font-medium mb-3">{selected.subject}</p>}
                        <div className="bg-gray-100 rounded-xl p-4 text-gray-700 text-sm leading-relaxed mb-5">{selected.message}</div>
                        <p className="text-gray-500 text-xs mb-5">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
                        <div className="flex gap-3">
                            <a href={`mailto:${selected.email}`} className="btn-primary text-sm px-4 py-2">Reply via Email</a>
                            {selected.phone && <a href={`https://wa.me/91${selected.phone}`} target="_blank" rel="noreferrer" className="btn-outline text-sm px-4 py-2">WhatsApp</a>}
                            <button onClick={() => del(selected._id)} className="px-4 py-2 text-sm text-red-600 border border-red-500/30 rounded-xl hover:bg-red-50 transition-all ml-auto">Delete</button>
                        </div>
                    </div>
                ) : (
                    <div className="card flex items-center justify-center text-gray-500 text-sm h-48">Select a message to read</div>
                )}
            </div>
        </>
    );
}