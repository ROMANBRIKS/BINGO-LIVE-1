import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Home, 
  Video, 
  User as UserIcon, 
  Shield, 
  Wallet, 
  Zap,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { seedGifts } from './seed';

// Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen').then(m => ({ default: m.HomeScreen })));
const LiveScreen = lazy(() => import('./screens/LiveScreen').then(m => ({ default: m.LiveScreen })));
const WatchScreen = lazy(() => import('./screens/WatchScreen').then(m => ({ default: m.WatchScreen })));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const AuthScreen = lazy(() => import('./screens/AuthScreen').then(m => ({ default: m.AuthScreen })));
const AdminScreen = lazy(() => import('./screens/AdminScreen').then(m => ({ default: m.AdminScreen })));

// Performance Monitor
const PerformanceMonitor = () => {
  useEffect(() => {
    const mountTime = performance.now();
    console.log(`[BingoLive] App mounted in ${mountTime.toFixed(2)}ms`);
    return () => console.log(`[BingoLive] App unmounted`);
  }, []);
  return null;
};

// Loading Fallback
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0502]">
    <div className="relative w-24 h-24 mb-8">
      <div className="absolute inset-0 border-4 border-[#ff4e00]/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-[#ff4e00] rounded-full border-t-transparent animate-spin" />
      <Zap className="absolute inset-0 m-auto text-[#ff4e00] animate-pulse" size={32} />
    </div>
    <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white/40 animate-pulse">Loading Bingo</h2>
  </div>
);

// Navigation Component
const Navbar = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Home' },
    { path: '/live', icon: <Video size={20} />, label: 'Go Live' },
    { path: '/profile', icon: <UserIcon size={20} />, label: 'Profile' },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ path: '/admin', icon: <Shield size={20} />, label: 'Admin' });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#ff4e00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,78,0,0.3)] group-hover:scale-110 transition-transform">
            <Zap size={20} fill="white" />
          </div>
          <span className="text-2xl font-black tracking-tighter italic uppercase">Bingo</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${
                location.pathname === item.path ? 'text-[#ff4e00]' : 'text-white/40 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
            <Wallet size={16} className="text-[#ff4e00]" />
            <span className="text-sm font-black tracking-tight">💎 {profile?.diamonds || 0}</span>
          </div>
          
          <button 
            onClick={logout}
            className="hidden md:flex items-center gap-2 text-white/20 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#151619] border-b border-white/10 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navItems.map(item => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl font-bold"
                >
                  <div className="flex items-center gap-3">{item.icon} {item.label}</div>
                  <ChevronRight size={16} className="text-white/20" />
                </Link>
              ))}
              <button 
                onClick={logout}
                className="w-full flex items-center justify-between p-4 bg-red-600/10 text-red-500 rounded-2xl font-bold"
              >
                <div className="flex items-center gap-3"><LogOut size={20} /> Logout</div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    seedGifts().catch(console.error);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <PerformanceMonitor />
      <div className="min-h-screen bg-[#0a0502] text-white selection:bg-[#ff4e00] selection:text-white">
        {user && <Navbar />}
        
        <main className={`max-w-7xl mx-auto px-6 ${user ? 'pt-32 pb-20' : ''}`}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/auth" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
              <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
              <Route path="/live" element={<ProtectedRoute><LiveScreen /></ProtectedRoute>} />
              <Route path="/watch/:streamId" element={<ProtectedRoute><WatchScreen /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminScreen /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
