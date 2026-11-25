import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Building2,
  Flame,
  Heart,
  LogOut,
  PlusCircle,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  Zap,
} from 'lucide-react';
import AdminDashboard from '../components/AdminDashboard';
import ChatWindow from '../components/ChatWindow';
import MatchSidebar from '../components/MatchSidebar';
import ProfileModal from '../components/ProfileModal';
import QuickAccountSwitcher from '../components/QuickAccountSwitcher';
import SwipeDeck from '../components/SwipeDeck';
import { useAuth } from '../context/AuthContext';
import { authApi, matchingApi, profileApi } from '../services/api';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

function getRoleBadgeStyle(role) {
  switch ((role || '').toLowerCase()) {
    case 'recruiter':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'admin':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}

export default function DashboardPage() {
  const { user, role, roleDisplay, logout } = useAuth();
  const isAdmin = (role || '').toLowerCase() === 'admin';

  // Admin can preview either Candidate or Recruiter (Company) feed
  const [previewRole, setPreviewRole] = useState(() =>
    role === 'recruiter' ? 'recruiter' : 'candidate'
  );
  const [personas, setPersonas] = useState({ candidates: [], jobs: [] });
  const [activePersonaId, setActivePersonaId] = useState(() => {
    if (role === 'recruiter') return user?.job_id || 'job_101';
    if (role === 'candidate') return user?.candidate_id || 'cand_1';
    return 'cand_1';
  });

  // Feed & Interactions state
  const [cards, setCards] = useState([]);
  const [matchedTagIds, setMatchedTagIds] = useState(() => new Set());
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [isActing, setIsActing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Matches & Saved Sidebar / Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [matches, setMatches] = useState([]);
  const [savedItems, setSavedItems] = useState([]);

  // Modals & Popovers
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [activeChatMatch, setActiveChatMatch] = useState(null);
  const [toast, setToast] = useState(null);
  const [matchCelebration, setMatchCelebration] = useState(null); // { title, subtitle }

  const effectiveRole = isAdmin ? previewRole : role === 'recruiter' ? 'recruiter' : 'candidate';

  const showToast = useCallback((title, message, type = 'info') => {
    setToast({ title, message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load personas list
  useEffect(() => {
    let active = true;
    authApi
      .getPersonas()
      .then((res) => {
        if (active && res?.success && res?.data) {
          setPersonas(res.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Load Feed, Matches, and Saved items whenever effectiveRole or activePersonaId changes
  const loadDashboardData = useCallback(async () => {
    setIsLoadingFeed(true);
    setFeedError('');
    try {
      const [feedRes, matchesRes, savedRes] = await Promise.all([
        matchingApi.getFeed(effectiveRole, activePersonaId),
        matchingApi.getMatches(effectiveRole, activePersonaId),
        matchingApi.getInteractions({
          role: effectiveRole,
          id: activePersonaId,
          action: 'save',
        }),
      ]);

      setCards(feedRes?.data || []);
      setMatches(matchesRes?.data || []);
      setSavedItems(savedRes?.data || []);
    } catch (err) {
      setFeedError(err?.response?.data?.message || 'ไม่สามารถโหลดข้อมูล Feed ได้');
    } finally {
      setIsLoadingFeed(false);
    }
  }, [effectiveRole, activePersonaId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Resolve matched tag IDs for the top card so JobCard highlights Matched Tags clearly
  const topCardId = cards[0]?.card_id;
  useEffect(() => {
    let active = true;
    async function loadMatchedTags() {
      if (!topCardId) {
        if (active) setMatchedTagIds(new Set());
        return;
      }
      try {
        if (effectiveRole === 'candidate') {
          const res = await profileApi.getCandidateTags(activePersonaId);
          if (active) {
            setMatchedTagIds(new Set((res?.tags || []).map((t) => t.tag_id)));
          }
        } else {
          const compositeId = `${topCardId}_${activePersonaId}`;
          const res = await matchingApi.getBreakdown(compositeId, {
            candidate_id: topCardId,
            job_id: activePersonaId,
          });
          if (active) {
            const breakdown = res?.data?.technical_breakdown || res?.breakdown || [];
            const ids = breakdown
              .filter((b) => b.status === 'matched')
              .map((b) => b.tag_id);
            setMatchedTagIds(new Set(ids));
          }
        }
      } catch {
        if (active) setMatchedTagIds(new Set());
      }
    }
    loadMatchedTags();
    return () => {
      active = false;
    };
  }, [effectiveRole, activePersonaId, topCardId]);

  const handleAdminPreviewChange = (nextRole) => {
    setPreviewRole(nextRole);
    if (nextRole === 'candidate') {
      const firstCand = personas.candidates?.[0]?.id || 'cand_1';
      setActivePersonaId(firstCand);
    } else {
      const firstJob = personas.jobs?.[0]?.id || 'job_101';
      setActivePersonaId(firstJob);
    }
  };

  const handleCardSwipe = useCallback(
    async (action, card) => {
      if (!card || isActing) return;
      setIsActing(true);

      const candidateId = effectiveRole === 'candidate' ? activePersonaId : card.card_id;
      const jobId = effectiveRole === 'recruiter' ? activePersonaId : card.card_id;

      try {
        const res = await matchingApi.createInteraction({
          candidate_id: candidateId,
          job_id: jobId,
          initiator_role: effectiveRole,
          action,
        });

        setCards((prev) => prev.slice(1));

        if (res?.is_matched) {
          setMatchCelebration({
            title: effectiveRole === 'candidate' ? card.title : card.full_name || card.name,
            subtitle: effectiveRole === 'candidate' ? card.company_name : card.title,
          });
          showToast('It’s a Match!', 'จับคู่สำเร็จทั้งสองฝ่ายแล้ว', 'success');
        } else if (action === 'save') {
          showToast('บันทึกการ์ดแล้ว', 'เพิ่มลงในรายการที่บันทึกไว้เรียบร้อย', 'info');
        } else if (action === 'express_interest') {
          showToast('ส่งความสนใจแล้ว', 'ระบบบันทึกความสนใจของคุณเรียบร้อย', 'success');
        }

        const [matchesRes, savedRes] = await Promise.all([
          matchingApi.getMatches(effectiveRole, activePersonaId),
          matchingApi.getInteractions({
            role: effectiveRole,
            id: activePersonaId,
            action: 'save',
          }),
        ]);
        setMatches(matchesRes?.data || []);
        setSavedItems(savedRes?.data || []);
      } catch (err) {
        showToast(
          'เกิดข้อผิดพลาด',
          err?.response?.data?.message || 'ไม่สามารถบันทึกการปัดการ์ดได้',
          'error'
        );
      } finally {
        setIsActing(false);
      }
    },
    [isActing, effectiveRole, activePersonaId, showToast]
  );

  const handleSimulateMatch = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    try {
      const targetCard = cards[0];
      const candidateId =
        effectiveRole === 'candidate'
          ? activePersonaId
          : targetCard?.card_id || personas.candidates?.[0]?.id || 'cand_1';
      const jobId =
        effectiveRole === 'recruiter'
          ? activePersonaId
          : targetCard?.card_id || personas.jobs?.[0]?.id || 'job_101';

      await matchingApi.simulateMatch({
        candidate_id: candidateId,
        job_id: jobId,
        initiator_role: effectiveRole,
      });

      // Refresh matches & feed so partner profile is 100% accurate and never swapped
      const [matchesRes, feedRes] = await Promise.all([
        matchingApi.getMatches(effectiveRole, activePersonaId),
        matchingApi.getFeed(effectiveRole, activePersonaId),
      ]);

      const updatedMatches = matchesRes?.data || [];
      setMatches(updatedMatches);
      setCards(feedRes?.data || []);

      const createdMatch = updatedMatches.find(
        (m) => m.candidate_id === candidateId && m.job_id === jobId
      );

      if (createdMatch) {
        const isCandView = effectiveRole === 'candidate';
        setMatchCelebration({
          title: isCandView ? createdMatch.job_title : createdMatch.candidate_name,
          subtitle: isCandView ? createdMatch.company_name : createdMatch.candidate_title,
        });
      }
      showToast('Simulate Match สำเร็จ', 'อัปเดตคู่ Match ใหม่เรียบร้อยแล้ว', 'success');
    } catch (err) {
      showToast(
        'จำลอง Match ไม่สำเร็จ',
        err?.response?.data?.message || 'เกิดข้อผิดพลาดในการจำลอง Match',
        'error'
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const handleConnectMatch = async (match) => {
    const matchId = match.match_id || `${match.candidate_id}_${match.job_id}`;
    try {
      await matchingApi.connectMatch(matchId, {
        candidate_id: match.candidate_id,
        job_id: match.job_id,
      });
      const matchesRes = await matchingApi.getMatches(effectiveRole, activePersonaId);
      setMatches(matchesRes?.data || []);
      showToast('เชื่อมต่อสำเร็จ', 'ปลดล็อกข้อมูลติดต่อและลิงก์สัมภาษณ์แล้ว', 'success');
    } catch (err) {
      showToast(
        'เชื่อมต่อไม่สำเร็จ',
        err?.response?.data?.message || 'ไม่สามารถเชื่อมต่อได้',
        'error'
      );
    }
  };

  const handleResetFeed = async () => {
    setIsLoadingFeed(true);
    try {
      await matchingApi.resetFeed(effectiveRole, activePersonaId);
      await loadDashboardData();
      showToast('รีเซ็ตการ์ดสำเร็จ', 'โหลดการ์ดทั้งหมดกลับมาใหม่แล้ว', 'info');
    } catch {
      showToast('ผิดพลาด', 'ไม่สามารถรีเซ็ตการ์ดได้', 'error');
      setIsLoadingFeed(false);
    }
  };

  // Keyboard navigation (Left=Pass, Up=Save, Right=Like)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (
        isDrawerOpen ||
        matchCelebration ||
        isSwitcherOpen ||
        isProfileModalOpen ||
        isAdminModalOpen ||
        activeChatMatch
      ) {
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
    handleCardSwipe,
    isDrawerOpen,
    matchCelebration,
    isSwitcherOpen,
    isProfileModalOpen,
    isAdminModalOpen,
    activeChatMatch,
  ]);

  const personaOptions = useMemo(() => {
    return effectiveRole === 'candidate' ? personas.candidates || [] : personas.jobs || [];
  }, [effectiveRole, personas]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Brand + Role Pill */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] via-[#4F46E5] to-[#EC4899] flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="hidden sm:inline font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                MATCH<span className="text-[#2563EB]">WORK</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border shrink-0 ${getRoleBadgeStyle(
                  role
                )}`}
              >
                {roleDisplay}
              </span>
            </div>
          </div>

          {/* Center: Admin View Switcher (Desktop >= lg) */}
          {isAdmin && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => handleAdminPreviewChange('candidate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  previewRole === 'candidate'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>มุมมอง Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => handleAdminPreviewChange('recruiter')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  previewRole === 'recruiter'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>มุมมอง Company</span>
              </button>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Profile / Post Job Button */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title={effectiveRole === 'candidate' ? 'แก้ไขโปรไฟล์และแท็ก' : 'สร้างประกาศงานใหม่'}
            >
              {effectiveRole === 'candidate' ? (
                <>
                  <UserCog className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden md:inline">โปรไฟล์</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden md:inline">โพสต์งาน</span>
                </>
              )}
            </button>

            {/* Admin Console Button (Only visible to Admin role) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Admin Management Console"
              >
                <ShieldCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* Mobile/Tablet Matches Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden relative p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                {matches.length}
              </span>
            </button>

            {/* Quick Account Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSwitcherOpen((prev) => !prev)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="สลับบัญชีทดสอบอย่างรวดเร็ว"
              >
                <Zap className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500" />
                <span className="hidden sm:inline">Switch</span>
              </button>

              {isSwitcherOpen && (
                <div className="absolute right-0 mt-2 z-50 animate-pop-in">
                  <QuickAccountSwitcher
                    variant="compact"
                    onSwitched={() => setIsSwitcherOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={user?.avatar || FALLBACK_AVATAR}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="text-left leading-tight max-w-[120px]">
                <div className="text-xs font-bold text-slate-900 truncate">{user?.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Layout: SwipeDeck + Persistent Desktop MatchSidebar */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-8 flex flex-col lg:flex-row items-start justify-center gap-7">
        {/* Left/Center: Feed & SwipeDeck */}
        <div className="w-full flex-1 flex flex-col items-center">
          {/* Tablet/Mobile Admin View Switcher */}
          {isAdmin && (
            <div className="lg:hidden w-full max-w-lg flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-4">
              <button
                type="button"
                onClick={() => handleAdminPreviewChange('candidate')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  previewRole === 'candidate'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>มุมมอง Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => handleAdminPreviewChange('recruiter')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  previewRole === 'recruiter'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>มุมมอง Company</span>
              </button>
            </div>
          )}

          {/* Feed Sub-header */}
          <div className="w-full max-w-lg flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                {effectiveRole === 'candidate' ? (
                  <>
                    <Briefcase className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="truncate">ตำแหน่งงานที่แนะนำสำหรับคุณ</span>
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="truncate">ผู้สมัครที่ตรงกับตำแหน่งของคุณ</span>
                  </>
                )}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                เรียงตามคะแนน Tag-Weighted Compatibility • เหลือ {cards.length} การ์ด
              </p>
            </div>

            {isAdmin && personaOptions.length > 0 && (
              <select
                value={activePersonaId}
                onChange={(e) => setActivePersonaId(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 max-w-full"
              >
                {personaOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.title} {p.company ? `(${p.company})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* SwipeDeck */}
          <div className="w-full max-w-lg">
            <SwipeDeck
              cards={cards}
              matchedTagIds={matchedTagIds}
              isLoading={isLoadingFeed}
              error={feedError}
              isActing={isActing}
              onSwipe={handleCardSwipe}
              onReset={handleResetFeed}
              onRetry={loadDashboardData}
            />
          </div>
        </div>

        {/* Right: MatchSidebar (Desktop Persistent + Mobile Drawer) */}
        <MatchSidebar
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          effectiveRole={effectiveRole}
          matches={matches}
          savedItems={savedItems}
          isSimulating={isSimulating}
          onSimulateMatch={handleSimulateMatch}
          onConnectMatch={handleConnectMatch}
          onOpenChat={(match) => {
            setActiveChatMatch(match);
            setIsDrawerOpen(false);
          }}
        />
      </main>

      {/* Profile / Post Job Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        effectiveRole={effectiveRole}
        activePersonaId={activePersonaId}
        user={user}
        onSaved={(result) => {
          showToast('บันทึกสำเร็จ', result.message, 'success');
          if (result.type === 'job' && result.job?.job_id && isAdmin) {
            setActivePersonaId(result.job.job_id);
          } else {
            loadDashboardData();
          }
        }}
      />

      {/* Admin Dashboard Modal (Admin Role Only) */}
      {isAdmin && (
        <AdminDashboard
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onDataChanged={loadDashboardData}
        />
      )}

      {/* Match Celebration Modal */}
      {matchCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl animate-pop-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#2563EB] to-[#EC4899] text-white flex items-center justify-center shadow-lg mb-4">
              <Heart className="w-8 h-8 fill-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">It’s a Match!</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              จับคู่สำเร็จกับ{' '}
              <span className="font-bold text-slate-900">{matchCelebration.title}</span>
              {matchCelebration.subtitle ? ` (${matchCelebration.subtitle})` : ''}
            </p>
            <button
              type="button"
              onClick={() => setMatchCelebration(null)}
              className="mt-6 w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              ดำเนินการต่อ
            </button>
          </div>
        </div>
      )}

      {/* Real-time Chat Window Modal */}
      <ChatWindow
        isOpen={Boolean(activeChatMatch)}
        onClose={() => setActiveChatMatch(null)}
        match={activeChatMatch}
        effectiveRole={effectiveRole}
        currentUser={user}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-xs animate-pop-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold">{toast.title}</div>
            <div className="text-[11px] text-slate-300">{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
