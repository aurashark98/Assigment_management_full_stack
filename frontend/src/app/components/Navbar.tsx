import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, ShieldCheck, UserRound, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clearAuthSessionStorage, touchAuthSession, validateAndRefreshAuthSession } from '../../utils/authSession';
import { legacyAuthClient } from '../../utils/legacyAuthClient';

type AuthMode = 'login';

interface AuthResponse {
  message?: string;
  user?: {
    id: string | number;
    email: string;
    username?: string | null;
    created_at?: string | null;
  };
}

interface AuthUser {
  id: string | number;
  email: string;
  username?: string | null;
  profilePhoto?: string | null;
}

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const API_BASE_URL = 'http://127.0.0.1:3032';
const AUTH_BASE_URL = 'http://127.0.0.1:3032/api/facility-helpdesk/auth';

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Treat root, /about, /analysis, and /work-order as top-level pages so the navbar stays consistent.
  const isLandingPage = currentPath === '/' || currentPath === '/about' || currentPath === '/analysis' || currentPath === '/work-order';
  const isAppPage = !isLandingPage;
  const showDashboardShortcut = Boolean(currentUserEmail) && currentPath !== '/dashboard';

  const navLinks: Array<{ label: string; id?: string; path?: string }> = [
    { label: 'Features', id: 'features' },
    { label: 'About', path: '/about' },
    { label: 'Analysis', path: '/analysis' },
    { label: 'Work Order', path: '/work-order' },
  ];

  useEffect(() => {
    const isSessionValid = validateAndRefreshAuthSession();
    if (!isSessionValid) {
      setCurrentUser(null);
      setCurrentUserEmail(null);
      return;
    }

    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(savedUser);

        const validateStoredUser = async () => {
          try {
            const response = await fetch(`${AUTH_BASE_URL}/profile/${parsedUser.id}`);
            const data = await response.json();

            if (!response.ok || !data.data?.user) {
              clearAuthSessionStorage();
              setCurrentUser(null);
              setCurrentUserEmail(null);
              return;
            }

            const refreshedUser: AuthUser = {
              id: data.data.user.id || data.data.user.user_id,
              email: data.data.user.email,
              username: data.data.user.username || data.data.user.employee_code || null,
              profilePhoto: data.data.user.profile_photo || null,
            };

            setCurrentUser(refreshedUser);
            setCurrentUserEmail(refreshedUser.email);
            localStorage.setItem('auth_user', JSON.stringify(refreshedUser));
            localStorage.setItem('auth_user_email', refreshedUser.email);
            touchAuthSession();
            window.dispatchEvent(new Event('auth-user-updated'));
          } catch {
            clearAuthSessionStorage();
            setCurrentUser(null);
            setCurrentUserEmail(null);
          }
        };

        validateStoredUser();
        return;
      } catch {
        localStorage.removeItem('auth_user');
      }
    }

    const savedEmail = localStorage.getItem('auth_user_email');
    if (savedEmail) {
      setCurrentUserEmail(savedEmail);
    }

    // Scroll event listener for navbar blur effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncUserFromStorage = () => {
      const savedUser = localStorage.getItem('auth_user');
      if (!savedUser) {
        setCurrentUser(null);
        setCurrentUserEmail(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser) as AuthUser;
        setCurrentUser(parsedUser);
        setCurrentUserEmail(parsedUser.email);
      } catch {
        clearAuthSessionStorage();
        setCurrentUser(null);
        setCurrentUserEmail(null);
      }
    };

    window.addEventListener('auth-user-updated', syncUserFromStorage as EventListener);
    window.addEventListener('storage', syncUserFromStorage);

    return () => {
      window.removeEventListener('auth-user-updated', syncUserFromStorage as EventListener);
      window.removeEventListener('storage', syncUserFromStorage);
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    const syncProfileSummary = async () => {
      try {
        const response = await fetch(`${AUTH_BASE_URL}/profile/${currentUser.id}`);
        const data = await response.json();
        if (!response.ok || !data.data?.user) return;

        const refreshedUser: AuthUser = {
          id: data.data.user.id || data.data.user.user_id,
          email: data.data.user.email,
          username: data.data.user.username || data.data.user.employee_code || null,
          profilePhoto: data.data.user.profile_photo || null,
        };

        setCurrentUser(refreshedUser);
        setCurrentUserEmail(refreshedUser.email);
        localStorage.setItem('auth_user', JSON.stringify(refreshedUser));
        localStorage.setItem('auth_user_email', refreshedUser.email);
        touchAuthSession();
        window.dispatchEvent(new Event('auth-user-updated'));
      } catch {
        // Keep navbar usable even when profile sync fails.
      }
    };

    syncProfileSummary();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!isAuthOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAuthModal();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEscape);
    };
  }, [isAuthOpen]);

  const navigateToSection = (sectionId: string) => {
    if (currentPath !== '/') {
      onNavigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update debug banner with current path and landing/app state to help diagnose issues
  // Debug banner removed — nothing to update here.

  const openAuthModal = (mode: AuthMode) => {
    setIsAuthOpen(true);
    setAuthError('');
    setAuthSuccess('');
    setShowPassword(false);
  };

  const closeAuthModal = () => {
    setIsAuthOpen(false);
    setAuthError('');
    setAuthSuccess('');
    setPassword('');
    setShowPassword(false);
  };

  const clearAuthForm = () => {
    setEmail('');
    setPassword('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserEmail(null);
    clearAuthSessionStorage();
    onNavigate('/');
  };

  const handleSubmitAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const normalizedInput = email.trim().toLowerCase();

    if (!normalizedInput || !password.trim()) {
      setAuthError('Username dan password wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = await legacyAuthClient.login(normalizedInput, password);
      const loggedEmail = userData.email || normalizedInput;
      const authUser: AuthUser = {
        id: userData.id || 0,
        email: loggedEmail,
        username: userData.username || null,
        profilePhoto: userData.profilePhoto || null,
      };

      setCurrentUser(authUser);
      setCurrentUserEmail(loggedEmail);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      localStorage.setItem('auth_user_email', loggedEmail);
      touchAuthSession();
      window.dispatchEvent(new Event('auth-user-updated'));
      setAuthError('');
      setAuthSuccess('Login berhasil.');
      clearAuthForm();

      setTimeout(() => {
        closeAuthModal();
        onNavigate('/dashboard');
      }, 500);
    } catch (err: any) {
      // Clear success and show error with debug info
      setAuthSuccess('');
      console.error('Auth request error:', err);
      setAuthError(err?.message || 'Gagal terhubung ke auth service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed left-0 right-0 top-0 z-50 transition-all duration-300 py-3 sm:py-4"
      >
        {/* Capsule Background */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`relative rounded-full px-4 sm:px-8 py-3 transition-all duration-300 ${
            isScrolled
              ? 'bg-white/98 backdrop-blur-2xl border border-slate-200/90 shadow-[0_14px_40px_rgba(15,23,42,0.16)]'
              : 'bg-gradient-to-r from-sky-50 via-white to-cyan-50 backdrop-blur-xl border border-slate-200/75 shadow-[0_10px_28px_rgba(15,23,42,0.12)]'
          }`}>
            
            {/* Content */}
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <motion.button 
                type="button" 
                onClick={() => {
                  onNavigate(isAppPage ? '/dashboard' : '/');
                  setIsMenuOpen(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 group flex-shrink-0"
              >
                <img
                  src="/maintenanceai-logo.svg"
                  alt="MaintenanceAI"
                  className="h-10 w-auto drop-shadow-[0_6px_14px_rgba(37,99,235,0.35)]"
                />
              </motion.button>

              {/* Desktop Navigation & Auth */}
              <div className="hidden md:flex items-center flex-1 ml-6">
                {/* Navigation Links - Desktop */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-7">
                    {navLinks.map((link) => (
                      <motion.button
                        key={link.label}
                        whileHover={{ y: -2 }}
                        type="button"
                        onClick={() => (link.path ? onNavigate(link.path) : navigateToSection(String(link.id || 'features')))}
                        className="group relative text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                      >
                        {link.label}
                        <motion.span
                          className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-cyan-600 group-hover:w-full transition-all duration-300 rounded-full"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Auth Section - Desktop */}
                <div className={`flex items-center gap-0 ${isLandingPage ? '' : 'ml-auto'}`}>
                  {currentUserEmail ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                      {showDashboardShortcut && (
                        <motion.button
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => onNavigate('/dashboard')}
                          className="app-btn-secondary rounded-full px-3 py-1.5 text-xs"
                        >
                          Dashboard
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => onNavigate('/profile')}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/40 bg-white/70 px-1.5 py-1 text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-200/60 hover:bg-white hover:shadow-md"
                        aria-label="Open profile"
                      >
                        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 shrink-0 border border-slate-200/60">
                          {currentUser?.profilePhoto ? (
                            <img
                              src={currentUser.profilePhoto}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-3.5 w-3.5 text-slate-600" />
                          )}
                        </span>
                        <span className="max-w-[100px] truncate text-xs font-semibold text-slate-700">
                          {currentUser?.username || currentUserEmail?.split('@')[0]}
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="app-btn-ghost rounded-full px-3 py-1.5 text-xs ml-1 sm:ml-2"
                      >
                        Logout
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openAuthModal('login')}
                        className="app-btn-secondary rounded-full px-3 py-1.5 text-xs"
                      >
                        Login
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              {/* Hamburger Menu Button - Mobile */}
              <motion.button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md flex-shrink-0 ${
                  isMenuOpen
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    : 'border-cyan-200/70 bg-gradient-to-br from-white/90 to-cyan-50/90 text-slate-700 hover:border-cyan-300'
                }`}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5 text-slate-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Mobile Menu - Slides down from capsule */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="md:hidden absolute left-4 right-4 top-full z-50 mt-3 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-4 text-slate-700 shadow-[0_28px_80px_rgba(15,23,42,0.12)]"
                >
                  <div className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full bg-cyan-100/40 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-blue-100/40 blur-3xl" />

                  <div className="relative mb-4 flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <img src="/maintenanceai-logo.svg" alt="MaintenanceAI" className="h-7 w-auto" />
                    </div>
                  </div>

                  {/* Mobile Nav Links */}
                  <div className="relative space-y-2 pb-4 border-b border-white/10">
                    {navLinks.map((link) => (
                      <motion.button
                        key={link.label}
                        whileHover={{ x: 4 }}
                        type="button"
                        onClick={() => {
                          if (link.path) {
                            onNavigate(link.path);
                          } else {
                            navigateToSection(String(link.id || 'features'));
                          }
                          setIsMenuOpen(false);
                        }}
                        className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
                      >
                        {link.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Mobile Auth */}
                  {currentUserEmail ? (
                    <div className="relative space-y-2 pt-4">
                      {showDashboardShortcut && ( 
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          type="button"
                          onClick={() => {
                            onNavigate('/dashboard');
                            setIsMenuOpen(false);
                          }}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-white"
                        >
                          Dashboard
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        type="button"
                        onClick={() => {
                          onNavigate('/profile');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                        aria-label="Open profile"
                      >
                        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 shrink-0 border border-slate-200">
                          {currentUser?.profilePhoto ? (
                            <img
                              src={currentUser.profilePhoto}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-4 w-4 text-slate-700" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {currentUser?.username || currentUserEmail?.split('@')[0]}
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-rose-300/50 hover:bg-white"
                      >
                        Logout
                      </motion.button>
                    </div>
                  ) : (
                    <div className="relative space-y-2 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          openAuthModal('login');
                          setIsMenuOpen(false);
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-cyan-300/60 hover:bg-white"
                      >
                        Login
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {isAuthOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-sm"
          onClick={closeAuthModal}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-slate-100 blur-3xl" />

            <div className="relative p-6 sm:p-7">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure Access
                  </div>
                    <h3 className="text-xl font-semibold text-slate-900">Welcome Back</h3>
                  <p className="mt-1 text-sm text-slate-500">
                      Login untuk lanjutkan ke dashboard MaintenanceAI.
                  </p>
                </div>
                <button
                  onClick={closeAuthModal}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-5 rounded-2xl bg-slate-100 p-1.5">
                <div className="rounded-2xl bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm">
                  Login
                </div>
              </div>

              <form onSubmit={handleSubmitAuth} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Username / Email
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 focus-within:border-blue-500">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username atau email"
                      className="w-full bg-transparent py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Password
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 focus-within:border-blue-500">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-transparent py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                {authError && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {authError}
                  </p>
                )}
                {authSuccess && (
                  <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                    {authSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary w-full rounded-2xl"
                >
                  {isSubmitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {isSubmitting
                    ? 'Processing...'
                    : 'Login'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Loading Overlay - Shows when authenticating */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="loading-overlay"
          >
            <div className="relative z-10 flex flex-col items-center gap-6">
              {/* Animated Spinner */}
              <div className="relative w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-blue-400 border-l-purple-400"
                />
              </div>

              {/* Loading Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  Loading your dashboard...
                </h3>
                <p className="text-slate-400 text-sm">
                    Verifying your credentials
                </p>
              </motion.div>

              {/* Loading Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '80%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full max-w-xs"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
