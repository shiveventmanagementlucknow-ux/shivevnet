import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const ALLOWED_ADMIN_ROLES = ['admin', 'superadmin'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await api.get('/auth/me');
      const userData = res.data.data;

      if (!ALLOWED_ADMIN_ROLES.includes(userData?.role)) {
        console.warn('⚠️  Non-admin token. Clearing session.');
        clearSession();
        return;
      }

      setUser(userData);
    } catch (err) {
      console.warn('Session validation failed:', err.response?.status, err.message);
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = async (email, password) => {
    clearSession();

    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data.data;

    if (!token) throw new Error('No token received from server');

    if (!ALLOWED_ADMIN_ROLES.includes(userData?.role)) {
      throw new Error('Access denied. Admin account required.');
    }

    localStorage.setItem('adminToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);

    return userData;
  };

  // ✅ FIX: logout ab backend ko call karta hai taaki tokenVersion rotate ho
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Backend call fail bhi ho toh local session clear karo
      console.warn('Logout API call failed (clearing locally):', err.message);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const isAdmin = !!user && ALLOWED_ADMIN_ROLES.includes(user.role);
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};