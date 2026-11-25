import { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Heart,
  Loader2,
  Mail,
  MessageCircle,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

function MatchSidebarContent({
  effectiveRole,
  matches = [],
  savedItems = [],
  isSimulating = false,
  onSimulateMatch,
  onConnectMatch,
  onOpenChat,
  onClose,
  showCloseButton = false,
}) {
  const [activeTab, setActiveTab] = useState('matches');
  const [connectingId, setConnectingId] = useState(null);

  const handleConnect = async (match) => {
    const id = match.match_id || `${match.candidate_id}_${match.job_id}`;
    setConnectingId(id);
    try {
      await onConnectMatch(match);
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900">Mutual Matches</h2>
            <p className="text-[11px] text-slate-500">
              {effectiveRole === 'candidate' ? 'บริษัทที่ใจตรงกันกับคุณ' : 'ผู้สมัครที่ใจตรงกันกับคุณ'}
            </p>
          </div>
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Simulate Mutual Match Button (Demo) */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-slate-200/80">
        <button
          type="button"
          disabled={isSimulating}
          onClick={onSimulateMatch}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer disabled:opacity-60"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>กำลังจำลอง Mutual Match...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Simulate Mutual Match</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs: Matches vs Saved */}
      <div className="flex p-2 gap-1.5 bg-slate-50 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'matches'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Matches ({matches.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-white text-amber-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Saved ({savedItems.length})
        </button>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {activeTab === 'matches' ? (
          matches.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">ยังไม่มีรายการ Match</p>
              <p className="text-[11px] text-slate-400 mt-1">
                ปัดขวาการ์ดที่สนใจ หรือกด Simulate Mutual Match ด้านบนเพื่อทดสอบ
              </p>
            </div>
          ) : (
            matches.map((m, idx) => {
              const isCandView = effectiveRole === 'candidate';
              // Strictly pick partner profile based on active viewer role (never swap sides)
              const partnerTitle = isCandView ? m.job_title : m.candidate_name;
              const partnerSubtitle = isCandView ? m.company_name : m.candidate_title;
              const partnerAvatar = isCandView
                ? m.company_logo || FALLBACK_AVATAR
                : m.candidate_avatar || FALLBACK_AVATAR;
              const partnerMeta = isCandView
                ? m.salary_range || m.location
                : m.candidate_expected_salary || m.candidate_email;
              const partnerEmail = isCandView ? m.contact_email : m.candidate_email;
              const matchId = m.match_id || `${m.candidate_id}_${m.job_id}`;
              const isConnecting = connectingId === matchId;

              return (
                <div
                  key={`${matchId}-${idx}`}
                  onClick={() => onOpenChat?.(m)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenChat?.(m);
                    }
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition shadow-2xs space-y-2.5 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={partnerAvatar}
                      alt={partnerTitle}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {partnerTitle}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          {Math.round(m.match_percentage || m.compatibility_score || 90)}%
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 truncate">
                        {partnerSubtitle}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{partnerMeta}</p>
                    </div>
                  </div>

                  {/* Connection / Interview Action */}
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    {m.is_connected ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Connected
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChat?.(m);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>แชต</span>
                          </button>
                          {partnerEmail && partnerEmail !== 'N/A' && (
                            <a
                              href={`mailto:${partnerEmail}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1 px-1"
                              title={partnerEmail}
                            >
                              <Mail className="w-3 h-3" />
                            </a>
                          )}
                          {m.interview_link && (
                            <a
                              href={m.interview_link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold inline-flex items-center gap-1 hover:bg-emerald-700"
                            >
                              <span>Meet</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChat?.(m);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>แชต</span>
                        </button>
                        <button
                          type="button"
                          disabled={isConnecting}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(m);
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition cursor-pointer disabled:opacity-60"
                        >
                          {isConnecting ? 'กำลังเชื่อมต่อ...' : 'Connect'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : savedItems.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">ยังไม่มีรายการที่บันทึกไว้</p>
          </div>
        ) : (
          savedItems.map((item, idx) => {
            const isCandView = effectiveRole === 'candidate';
            const title = isCandView
              ? item.job?.title || item.job_id
              : item.candidate?.full_name || item.candidate_id;
            const subtitle = isCandView
              ? item.job?.company_name || 'Saved Job'
              : item.candidate?.title || 'Saved Candidate';
            const avatar = isCandView
              ? item.job?.company_logo || FALLBACK_AVATAR
              : item.candidate?.avatar || FALLBACK_AVATAR;

            return (
              <div
                key={item.id || `${item.candidate_id}-${item.job_id}-${idx}`}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center gap-3"
              >
                <img
                  src={avatar}
                  alt={title}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{subtitle}</div>
                </div>
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function MatchSidebar({
  isOpen,
  onClose,
  effectiveRole,
  matches,
  savedItems,
  isSimulating,
  onSimulateMatch,
  onConnectMatch,
  onOpenChat,
}) {
  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
        <div className="sticky top-24 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden h-[calc(100vh-7.5rem)]">
          <MatchSidebarContent
            effectiveRole={effectiveRole}
            matches={matches}
            savedItems={savedItems}
            isSimulating={isSimulating}
            onSimulateMatch={onSimulateMatch}
            onConnectMatch={onConnectMatch}
            onOpenChat={onOpenChat}
          />
        </div>
      </aside>

      {/* Mobile / Tablet Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs lg:hidden">
          <div className="w-full max-w-sm h-full shadow-2xl animate-pop-in">
            <MatchSidebarContent
              effectiveRole={effectiveRole}
              matches={matches}
              savedItems={savedItems}
              isSimulating={isSimulating}
              onSimulateMatch={onSimulateMatch}
              onConnectMatch={onConnectMatch}
              onOpenChat={onOpenChat}
              onClose={onClose}
              showCloseButton
            />
          </div>
        </div>
      )}
    </>
  );
}
