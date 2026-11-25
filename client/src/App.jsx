import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

function AppShell() {
  const { isAuthenticated, isInitializing, user, role } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-xs font-medium text-slate-500">กำลังตรวจสอบเซสชัน...</p>
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
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
