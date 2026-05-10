import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { FloatingChatbot } from './components/FloatingChatbot';
import { Navbar } from './components/Navbar';
import { ProfilePage } from './components/ProfilePage';
import { UserWorkOrderDashboard } from './components/UserWorkOrderDashboard';
import { WorkRequestDetailPage } from './components/WorkRequestDetailPage';
import { WorkOrderCreatePage } from './components/WorkOrderCreatePage';
import { AnalysisPage } from './components/AnalysisPage';
import { validateAndRefreshAuthSession } from '../utils/authSession';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('auth_user_email') || localStorage.getItem('auth_user')));

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('auth_user_email') || localStorage.getItem('auth_user')));
    };

    const enforceSessionWindow = () => {
      const isValid = validateAndRefreshAuthSession();
      const privatePaths = ['/profile', '/dashboard', '/work-requests/', '/work-order'];
      const isPrivatePath = privatePaths.some((path) => window.location.pathname.startsWith(path));
      if (!isValid && isPrivatePath) {
        window.history.replaceState({}, '', '/');
        setCurrentPath('/');
      }
      syncAuthState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        enforceSessionWindow();
      }
    };

    const handleAuthUserUpdated = () => syncAuthState();

    enforceSessionWindow();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('auth-user-updated', handleAuthUserUpdated);
    window.addEventListener('storage', handleAuthUserUpdated);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('auth-user-updated', handleAuthUserUpdated);
      window.removeEventListener('storage', handleAuthUserUpdated);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (path === currentPath) return;
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isProfilePage = currentPath === '/profile';
  const isDashboardPage = currentPath === '/dashboard';
  const isWorkOrderCreatePage = currentPath === '/work-order';
  const isWorkRequestDetailPage = currentPath.startsWith('/work-requests/');
  const isAnalysisPage = currentPath === '/analysis';
  const isAboutPage = currentPath === '/about';
  const detailReportId = isWorkRequestDetailPage ? currentPath.replace('/work-requests/', '').trim() : '';
  const isLandingPage = !isProfilePage && !isDashboardPage && !isWorkRequestDetailPage && !isAnalysisPage && !isAboutPage;
  const isTopLevelPage = isLandingPage || isAboutPage;

  return (
    <div className="app-shell min-h-screen font-[Inter] overflow-x-hidden text-slate-900 antialiased selection:bg-blue-100 selection:text-slate-900">
      <Navbar currentPath={currentPath} onNavigate={navigateTo} />

      <main className={isLandingPage ? 'pt-20' : 'pt-24 pb-8'}>
        <AnimatePresence mode="wait">
          {isProfilePage ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <ProfilePage />
            </motion.div>
          ) : isDashboardPage ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <UserWorkOrderDashboard onNavigate={navigateTo} />
            </motion.div>
          ) : isWorkOrderCreatePage ? (
            <motion.div
              key="work-order-create"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <WorkOrderCreatePage onNavigate={navigateTo} />
            </motion.div>
          ) : isAnalysisPage ? (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <AnalysisPage />
            </motion.div>
          ) : isAboutPage ? (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <HowItWorks
                isAuthenticated={isAuthenticated}
                onGetStarted={() => navigateTo('/work-order')}
              />
            </motion.div>
          ) : isWorkRequestDetailPage ? (
            <motion.div
              key="work-request-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <WorkRequestDetailPage reportId={detailReportId} onNavigate={navigateTo} />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <Hero />
              <div id="features">
                <Features />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {isTopLevelPage && <Footer />}
      {(isTopLevelPage || isAnalysisPage) && <FloatingChatbot />}
    </div>
  );
}
