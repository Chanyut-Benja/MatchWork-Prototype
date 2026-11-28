import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Heart,
  LogOut,
  PlusCircle,
  Settings,
  ShieldCheck,
  Terminal,
  UserCheck,
} from 'lucide-react';
import AdminDashboard from '../components/AdminDashboard';
import AdvancedFiltersBar from '../components/AdvancedFiltersBar';
import ChatWindow from '../components/ChatWindow';
import MatchSidebar from '../components/MatchSidebar';
import QuickAccountSwitcher from '../components/QuickAccountSwitcher';
import SwipeDeck from '../components/SwipeDeck';
import JobPostPage from './JobPostPage';
import ProfileSettingsPage from './ProfileSettingsPage';
import BrandMark from '../components/ui/BrandMark';
import ThemeToggle from '../components/ui/ThemeToggle';
import Toast from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';

function parseSettingsPath(pathname) {
  if (!pathname.startsWith('/settings')) return null;
  const parts = pathname.split('/').filter(Boolean);
  return parts[1] || '';
}

export default function DashboardPage() {
  const { user, role, roleDisplay, logout } = useAuth();
  const isAdmin = (role || '').toLowerCase() === 'admin';

  const [previewRole, setPreviewRole] = useState(() =>
    role === 'recruiter' ? 'recruiter' : 'candidate'
  );
  const [activePersonaId, setActivePersonaId] = useState(() => {
    if (role === 'recruiter') return user?.job_id || 'job_101';
    if (role === 'candidate') return user?.candidate_id || 'cand_1';
    return 'cand_1';
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState(() =>
    parseSettingsPath(window.location.pathname)
  );
  const [isJobPostPage, setIsJobPostPage] = useState(
    () => window.location.pathname === '/jobs/new'
  );
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [activeChatMatch, setActiveChatMatch] = useState(null);
  const [toast, setToast] = useState(null);

  const effectiveRole = isAdmin ? previewRole : role === 'recruiter' ? 'recruiter' : 'candidate';
  const isSettingsPage = settingsSection !== null;

  useEffect(() => {
    const onPopState = () => {
      setSettingsSection(parseSettingsPath(window.location.pathname));
      setIsJobPostPage(window.location.pathname === '/jobs/new');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateToSettings = useCallback(
    (section) => {
      const defaultSection = effectiveRole === 'candidate' ? 'profile' : 'job-info';
      const target = section || defaultSection;
      const targetPath = `/settings/${target}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
      setIsJobPostPage(false);
      setSettingsSection(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [effectiveRole]
  );

  const navigateToJobPost = useCallback(() => {
    if (window.location.pathname !== '/jobs/new') {
      window.history.pushState({}, '', '/jobs/new');
    }
    setSettingsSection(null);
    setIsJobPostPage(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToDashboard = useCallback(() => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setSettingsSection(null);
    setIsJobPostPage(false);
  }, []);

  const showToast = useCallback((title, message, type = 'info') => {
    setToast({ title, message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const {
    personas,
    cards,
    matchedTagIds,
    isLoadingFeed,
    feedError,
    isActing,
    isSimulating,
    matches,
    savedItems,
    historyItems,
    closingSoonCount,
    canUndo,
    filters,
    setFilters,
    resetFilters,
    matchCelebration,
    setMatchCelebration,
    loadDashboardData,
    handleCardSwipe,
    handleUndoLast,
    handleRestoreInteraction,
    handleUpdateInteractionAction,
    handleSimulateMatch,
    handleConnectMatch,
    handleResetFeed,
  } = useDashboardData({ effectiveRole, activePersonaId, showToast });

  const handleAdminPreviewChange = (nextRole) => {
    setPreviewRole(nextRole);
    if (nextRole === 'candidate') {
      setActivePersonaId(personas.candidates?.[0]?.id || 'cand_1');
    } else {
      setActivePersonaId(personas.jobs?.[0]?.id || 'job_101');
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (
        isDrawerOpen ||
        matchCelebration ||
        isSwitcherOpen ||
        isSettingsPage ||
        isJobPostPage ||
        isAdminModalOpen ||
        activeChatMatch
      ) {
        return;
      }
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }
      if ((e.key === 'z' || e.key === 'Z') && canUndo) {
        handleUndoLast();
        return;
      }
      const topCard = cards[0];
      if (!topCard) return;
      if (e.key === 'ArrowLeft') handleCardSwipe('skip', topCard);
      else if (e.key === 'ArrowUp') handleCardSwipe('save', topCard);
      else if (e.key === 'ArrowRight') handleCardSwipe('express_interest', topCard);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    cards,
    canUndo,
    handleCardSwipe,
    handleUndoLast,
    isDrawerOpen,
    matchCelebration,
    isSwitcherOpen,
    isSettingsPage,
    isJobPostPage,
    isAdminModalOpen,
    activeChatMatch,
  ]);

  const personaOptions = useMemo(() => {
    return effectiveRole === 'candidate' ? personas.candidates || [] : personas.jobs || [];
  }, [effectiveRole, personas]);

  if (isJobPostPage) {
    return (
      <>
        <JobPostPage
          user={user}
          onBack={navigateToDashboard}
          onCreated={(result) => {
            if (result?.data?.job_id) {
              setActivePersonaId(result.data.job_id);
            }
            loadDashboardData();
            navigateToDashboard();
            showToast(
              'เผยแพร่ประกาศงานสำเร็จ',
              result?.message || 'สร้างประกาศงานใหม่และคำนวณผู้สมัครที่ตรงกันแล้ว',
              'success'
            );
          }}
          onNotify={showToast}
        />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  if (isSettingsPage) {
    return (
      <>
        <ProfileSettingsPage
          effectiveRole={effectiveRole}
          activePersonaId={activePersonaId}
          setActivePersonaId={setActivePersonaId}
          isAdmin={isAdmin}
          personaOptions={personaOptions}
          user={user}
          activeSection={settingsSection}
          onNavigateSection={navigateToSettings}
          onBack={navigateToDashboard}
          onSaved={(result) => {
            loadDashboardData();
            showToast(
              'บันทึกสำเร็จ',
              result?.message || 'อัปเดตข้อมูลและคำนวณคะแนนใหม่แล้ว',
              'success'
            );
          }}
          onNotify={showToast}
        />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] text-[#111111] dark:text-neutral-100 flex flex-col overflow-x-hidden">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-14 bg-white dark:bg-[#141416] border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
          {/* Left: Brand + Role */}
          <div className="flex items-center gap-3 min-w-0">
            <BrandMark size="sm" />
            <span className="hidden sm:inline-block h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 font-mono-num text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
              {roleDisplay}
            </span>
          </div>

          {/* Center: Admin View Toggle */}
          {isAdmin && (
            <div className="hidden md:flex items-center border border-neutral-200 dark:border-neutral-800 rounded-md p-0.5 bg-neutral-50 dark:bg-neutral-900">
              <button
                type="button"
                onClick={() => handleAdminPreviewChange('candidate')}
                className={`px-2.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  effectiveRole === 'candidate'
                    ? 'bg-white dark:bg-[#141416] text-[#111111] dark:text-white border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                มุมมองผู้หางาน
              </button>
              <button
                type="button"
                onClick={() => handleAdminPreviewChange('recruiter')}
                className={`px-2.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  effectiveRole === 'recruiter'
                    ? 'bg-white dark:bg-[#141416] text-[#111111] dark:text-white border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                มุมมองบริษัท
              </button>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {effectiveRole === 'recruiter' && (
              <button
                type="button"
                onClick={navigateToJobPost}
                className="px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-600 text-xs font-medium text-[#111111] dark:text-neutral-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ประกาศงานใหม่</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-600 text-xs font-medium text-[#111111] dark:text-neutral-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span className="hidden sm:inline">จัดการระบบ</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] text-xs font-medium text-[#111111] dark:text-neutral-100 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="font-mono-num">{matches.length}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSwitcherOpen((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-white dark:hover:bg-[#141416] text-xs font-medium text-neutral-700 dark:text-neutral-200 inline-flex items-center gap-1.5 cursor-pointer"
                title="สลับบัญชีทดสอบ (Demo)"
              >
                <Terminal className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span className="hidden md:inline">Demo</span>
              </button>

              {isSwitcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSwitcherOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50">
                    <QuickAccountSwitcher
                      variant="compact"
                      onSwitched={() => setIsSwitcherOpen(false)}
                    />
                  </div>
                </>
              )}
            </div>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => navigateToSettings(effectiveRole === 'candidate' ? 'profile' : 'notifications')}
              className="px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-600 text-xs font-medium text-[#111111] dark:text-neutral-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ตั้งค่าและบัญชีผู้ใช้"
              aria-label="ตั้งค่าและบัญชีผู้ใช้"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">ตั้งค่า</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-red-300 dark:hover:border-red-800 hover:text-red-700 dark:hover:text-red-400 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 flex flex-col">
          {/* Context Strip */}
          <div className="max-w-[480px] w-full mx-auto mb-5 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <p className="font-mono-num text-[10px] uppercase tracking-widest text-neutral-400">
                {effectiveRole === 'candidate' ? 'Candidate Discover' : 'Recruiter Discover'}
              </p>
              <h1 className="text-base font-semibold text-[#111111] dark:text-white flex items-center gap-2 mt-0.5">
                {effectiveRole === 'candidate' ? (
                  <>
                    <Briefcase className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    <span>ตำแหน่งงานที่แนะนำสำหรับคุณ</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    <span>ผู้สมัครที่ตรงกับตำแหน่งงาน</span>
                  </>
                )}
              </h1>
            </div>

            {isAdmin && personaOptions.length > 0 && (
              <select
                value={activePersonaId}
                onChange={(e) => setActivePersonaId(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-[#141416] text-[#111111] dark:text-neutral-100 focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
              >
                {personaOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <AdvancedFiltersBar
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
              effectiveRole={effectiveRole}
            />

            <SwipeDeck
              cards={cards}
              matchedTagIds={matchedTagIds}
              isLoading={isLoadingFeed}
              error={feedError}
              isActing={isActing}
              canUndo={canUndo}
              onSwipe={handleCardSwipe}
              onUndo={handleUndoLast}
              onReset={handleResetFeed}
              onRetry={loadDashboardData}
            />

            <p className="text-center text-[11px] text-neutral-400 font-mono-num mt-5">
              คีย์ลัด: ← ข้าม · ↑ บันทึก · → สนใจ · Z ย้อนกลับ
            </p>
          </div>
        </main>

        <MatchSidebar
          effectiveRole={effectiveRole}
          matches={matches}
          savedItems={savedItems}
          historyItems={historyItems}
          closingSoonCount={closingSoonCount}
          isSimulating={isSimulating}
          onSimulateMatch={handleSimulateMatch}
          onConnectMatch={handleConnectMatch}
          onOpenChat={(match) => setActiveChatMatch(match)}
          onRestoreItem={handleRestoreInteraction}
          onUpdateAction={handleUpdateInteractionAction}
          isDrawerOpen={isDrawerOpen}
          onCloseDrawer={() => setIsDrawerOpen(false)}
        />
      </div>

      {/* Match Celebration Modal */}
      {matchCelebration && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setMatchCelebration(null)}
        >
          <div
            className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-sm w-full p-6 text-center shadow-lg animate-editorial-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-mono-num text-[11px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-medium">
              Mutual Match
            </p>
            <h3 className="text-lg font-semibold text-[#111111] dark:text-white mt-1">
              {matchCelebration.title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-5">
              {matchCelebration.subtitle}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMatchCelebration(null)}
                className="flex-1 py-2 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer"
              >
                ปัดการ์ดต่อ
              </button>
              <button
                type="button"
                onClick={() => {
                  setMatchCelebration(null);
                  setIsDrawerOpen(true);
                }}
                className="flex-1 py-2 px-3 rounded-md bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-[#111111] text-xs font-medium cursor-pointer"
              >
                ดูรายการจับคู่
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <AdminDashboard
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onDataChanged={loadDashboardData}
        />
      )}

      <ChatWindow
        isOpen={Boolean(activeChatMatch)}
        onClose={() => setActiveChatMatch(null)}
        match={activeChatMatch}
        effectiveRole={effectiveRole}
        currentUser={user}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Floating Matches Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 group">
        <div
          role="tooltip"
          className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute bottom-full right-0 mb-2.5 whitespace-nowrap px-3 py-1.5 rounded-md bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-medium shadow-md"
        >
          แสดงรายการจับคู่ (Matches)
        </div>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="แสดงรายการจับคู่ (Matches)"
          title="แสดงรายการจับคู่ (Matches)"
          className="relative w-12 h-12 rounded-full bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-[#111111] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-neutral-800 dark:border-neutral-200"
        >
          <Heart className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          {matches.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-emerald-600 text-white font-mono-num text-[11px] font-semibold flex items-center justify-center border-2 border-[#FAFAFA] dark:border-[#0B0B0C]">
              {matches.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
