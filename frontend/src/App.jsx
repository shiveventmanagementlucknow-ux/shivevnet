import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy, memo, useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useUserAuth } from "./context/UserAuthContext";
import WhatsAppButton from "./components/common/WhatsAppButton";

// 🚀 Lazy loading (code splitting)
const HomePage = lazy(() => import("./pages/HomePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const UserForgotPassword = lazy(() => import("./pages/UserForgotPassword"));
const UserResetPassword = lazy(() => import("./pages/UserResetPassword"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

// Admin (lazy)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminForgotPassword = lazy(() => import("./pages/admin/AdminForgotPassword"));
const AdminResetPassword = lazy(() => import("./pages/admin/AdminResetPassword"));
const AdminSetup = lazy(() => import("./pages/admin/AdminSetup"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

// 🔄 Optimized Spinner (memoized)
const Spinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
));

// 🔐 Admin Protected
const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/admin/login" replace />;
};

// 🔓 Admin Public
const AdminPublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/admin/dashboard" replace /> : children;
};

// 👤 User Protected
const UserProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useUserAuth();
  if (loading) return <Spinner />;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// 🔝 Auto Scroll to Top on Navigation (Optimized, zero lag)
const ScrollToTop = memo(() => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Instant scroll to top to avoid laggy feeling during route transitions
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
});

// 🚀 MAIN APP
export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const [isNavigating, setIsNavigating] = useState(false);

  // Lightweight GPU-Accelerated Route Transition Animation
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 200); // Snappy 200ms transition
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Spinner />}>
        <div className={`transition-opacity duration-200 ease-in-out will-change-[opacity] ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
          <Routes>

            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<UserForgotPassword />} />
            <Route path="/reset-password/:token" element={<UserResetPassword />} />

            {/* User */}
            <Route path="/profile" element={
              <UserProtectedRoute>
                <ProfilePage />
              </UserProtectedRoute>
            } />

            {/* Admin Auth */}
            <Route path="/admin/login" element={
              <AdminPublicRoute>
                <AdminLogin />
              </AdminPublicRoute>
            } />

            <Route path="/admin/forgot-password" element={
              <AdminPublicRoute>
                <AdminForgotPassword />
              </AdminPublicRoute>
            } />

            <Route path="/admin/reset-password/:token" element={
              <AdminPublicRoute>
                <AdminResetPassword />
              </AdminPublicRoute>
            } />

            <Route path="/admin/setup" element={
              <AdminPublicRoute>
                <AdminSetup />
              </AdminPublicRoute>
            } />

            {/* Admin Protected */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="pricing" element={<AdminPricing />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <h1 className="text-8xl font-bold gradient-text">404</h1>
                <p className="text-gray-500 text-xl">Page not found</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            } />

          </Routes>
        </div>
      </Suspense>

      {!isAdmin && <WhatsAppButton />}
    </>
  );
}