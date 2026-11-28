import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

function AppShell() {
  const { isAuthenticated, isInitializing, user, role } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-[#111111] dark:text-neutral-100 animate-spin" />
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          กำลังตรวจสอบเซสชัน...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Keying DashboardPage by the active user/role/persona guarantees zero stale state on account switch
  const sessionKey = `${user?.id || user?.email || 'anon'}:${role || 'candidate'}:${
    user?.candidate_id || user?.job_id || ''
  }`;

  return <DashboardPage key={sessionKey} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
