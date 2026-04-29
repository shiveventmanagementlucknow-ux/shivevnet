import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/bookings', icon: '📅', label: 'Bookings' },
  { to: '/admin/contacts', icon: '✉️', label: 'Messages' },
  { to: '/admin/blogs', icon: '📝', label: 'Blogs' },
  { to: '/admin/gallery', icon: '🖼️', label: 'Gallery' },
  { to: '/admin/services', icon: '🎯', label: 'Services' },
  { to: '/admin/testimonials', icon: '⭐', label: 'Testimonials' },
  { to: '/admin/pricing', icon: '💰', label: 'Pricing' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">E</div>
          <span className="font-display text-lg font-bold text-gray-900"> Shiv <span className="text-primary-400"></span>Event Management<span className="gradient-text"></span></span>
        </div>
        <p className="text-gray-400 text-xs mt-1 ml-10">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-primary-50 text-primary-600 border border-primary-200'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <div className="text-gray-900 text-sm font-medium truncate">{user?.name || 'Admin'}</div>
            <div className="text-gray-500 text-xs truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
          🚪 Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white border-r border-gray-200 flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50">
            <div className="w-5 flex flex-col gap-1.5">
              <span className="block h-0.5 bg-current" />
              <span className="block h-0.5 bg-current" />
              <span className="block h-0.5 bg-current" />
            </div>
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <a href="/" target="_blank" rel="noreferrer"
              className="text-xs text-gray-500 hover:text-primary-600 transition-colors">
              View Website ↗
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
