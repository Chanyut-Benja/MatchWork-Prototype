import { useState } from 'react';
import {
  BellRing,
  Bookmark,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Heart,
  History,
  Loader2,
  MessageCircle,
  RotateCcw,
  Trash2,
  X,
  Zap,
} from 'lucide-react';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

const ACTION_BADGE = {
  skip: {
    label: 'ข้ามแล้ว',
    className:
      'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400',
  },
  save: {
    label: 'บันทึกไว้',
    className:
      'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  },
  express_interest: {
    label: 'สนใจ',
    className:
      'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  },
};

function MatchSidebarContent({
  effectiveRole,
  matches = [],
  savedItems = [],
  historyItems = [],
  closingSoonCount = 0,
  isSimulating = false,
  onSimulateMatch,
  onConnectMatch,
  onOpenChat,
  onRestoreItem,
  onUpdateAction,
  onClose,
  showCloseButton = false,
}) {
  const [activeTab, setActiveTab] = useState('matches');
  const [historyFilter, setHistoryFilter] = useState('all');
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

  const filteredHistory =
    historyFilter === 'all'
      ? historyItems
      : historyItems.filter((item) => item.action === historyFilter);

  const isCandView = effectiveRole === 'candidate';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#141416]">
      <div className="px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-sm text-[#111111] dark:text-white">
            การจับคู่และรายการของคุณ
          </h2>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {isCandView
              ? 'จับคู่, งานที่บันทึกไว้ และประวัติการปัด'
              : 'จับคู่, ผู้สมัครที่บันทึกไว้ และประวัติการปัด'}
          </p>
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-300 cursor-pointer"
            aria-label="ปิดแถบรายการจับคู่"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`py-2.5 text-[11px] font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'matches'
              ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white bg-white dark:bg-[#141416]'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          จับคู่ ({matches.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`py-2.5 text-[11px] font-medium border-b-2 transition-colors cursor-pointer inline-flex items-center justify-center gap-1 ${
            activeTab === 'saved'
              ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white bg-white dark:bg-[#141416]'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          <span>บันทึก ({savedItems.length})</span>
          {closingSoonCount > 0 && (
            <span
              className="w-2 h-2 rounded-full bg-amber-500"
              title={`มี ${closingSoonCount} งานใกล้ปิดรับสมัคร`}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`py-2.5 text-[11px] font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white bg-white dark:bg-[#141416]'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          ประวัติ ({historyItems.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80">
        {activeTab === 'matches' && (
          matches.length === 0 ? (
            <div className="p-8 text-center">
              <Heart className="w-6 h-6 text-neutral-300 dark:text-neutral-700 mx-auto mb-2.5" />
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                ยังไม่มี Mutual Match
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                ปัดสนใจการ์ดที่ถูกใจ หรือใช้ปุ่มจำลองด้านล่างเพื่อทดสอบการแชท
              </p>
            </div>
          ) : (
            matches.map((match) => {
              const id = match.match_id || `${match.candidate_id}_${match.job_id}`;
              const title = isCandView ? match.job_title : match.candidate_name;
              const subtitle = isCandView ? match.company_name : match.candidate_title;
              const avatar = isCandView
                ? match.company_logo || FALLBACK_AVATAR
                : match.candidate_avatar || FALLBACK_AVATAR;
              const score = Math.round(match.compatibility_score || match.match_percentage || 0);
              const isConnecting = connectingId === id;

              return (
                <div
                  key={id}
                  className="p-3.5 hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={avatar}
                      alt={title}
                      className="w-10 h-10 rounded-md object-cover border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-900"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#111111] dark:text-neutral-100 truncate">
                          {title}
                        </h4>
                        <span className="font-mono-num text-[11px] font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                          {score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {match.is_connected ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenChat(match)}
                          className="flex-1 py-1.5 px-3 rounded-md bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-[#111111] text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>เปิดแชท</span>
                        </button>
                        {match.interview_link && (
                          <a
                            href={match.interview_link}
                            target="_blank"
                            rel="noreferrer"
                            className="py-1.5 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:border-[#111111] dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium inline-flex items-center gap-1"
                            title="ลิงก์นัดสัมภาษณ์"
                          >
                            <span>Meet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={isConnecting}
                        onClick={() => handleConnect(match)}
                        className="w-full py-1.5 px-3 rounded-md border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {isConnecting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>ยืนยันเชื่อมต่อและเริ่มแชท</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        )}

        {activeTab === 'saved' && (
          <>
            {closingSoonCount > 0 && (
              <div className="p-3 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 flex items-start gap-2">
                <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong>แจ้งเตือนใกล้ปิดรับสมัคร:</strong> มี {closingSoonCount} งานที่บันทึกไว้กำลังจะปิดรับภายใน 5 วัน
                </p>
              </div>
            )}

            {savedItems.length === 0 ? (
              <div className="p-8 text-center">
                <Bookmark className="w-6 h-6 text-neutral-300 dark:text-neutral-700 mx-auto mb-2.5" />
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  ยังไม่มีรายการที่บันทึกไว้
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  ปัดขึ้นหรือกด "บันทึก" บนการ์ดที่สนใจเพื่อเก็บไว้ดูภายหลัง
                </p>
              </div>
            ) : (
              savedItems.map((item, idx) => {
                const title = isCandView ? item.job_title : item.candidate_name;
                const subtitle = isCandView ? item.company_name : item.candidate_title;
                const score = Math.round(item.match_score || 0);

                return (
                  <div
                    key={item.interaction_id || `${item.candidate_id}_${item.job_id}_${idx}`}
                    className="p-3.5 space-y-2.5 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111111] dark:text-neutral-100 truncate">
                          {title}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                          {subtitle} · {item.salary_range || item.candidate_expected_salary}
                        </p>
                      </div>
                      <span className="font-mono-num text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                        {score}%
                      </span>
                    </div>

                    {isCandView && item.application_deadline && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono-num text-[10px] ${
                            item.is_closing_soon
                              ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-medium'
                              : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          <CalendarClock className="w-3 h-3" />
                          {item.days_until_deadline === 0
                            ? 'ปิดรับสมัครวันนี้!'
                            : item.days_until_deadline > 0
                              ? `ปิดรับใน ${item.days_until_deadline} วัน (${item.application_deadline})`
                              : `ปิดรับแล้ว (${item.application_deadline})`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {onUpdateAction && (
                        <button
                          type="button"
                          onClick={() => onUpdateAction(item, 'express_interest')}
                          className="flex-1 py-1.5 px-2.5 rounded-md bg-[#111111] dark:bg-white hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white dark:text-[#111111] dark:hover:text-white text-[11px] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Heart className="w-3 h-3" />
                          <span>สนใจ / สมัคร</span>
                        </button>
                      )}
                      {onRestoreItem && (
                        <button
                          type="button"
                          onClick={() => onRestoreItem(item)}
                          className="py-1.5 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:border-red-300 dark:hover:border-red-800 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                          title="นำออกจากรายการบันทึก"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>นำออก</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            <div className="p-2.5 bg-neutral-50/70 dark:bg-neutral-900/40 flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: 'all', label: 'ทั้งหมด' },
                { key: 'skip', label: 'ข้าม' },
                { key: 'express_interest', label: 'สนใจ' },
                { key: 'save', label: 'บันทึก' },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setHistoryFilter(pill.key)}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium whitespace-nowrap cursor-pointer border ${
                    historyFilter === pill.key
                      ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] border-[#111111] dark:border-white'
                      : 'bg-white dark:bg-[#141416] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center">
                <History className="w-6 h-6 text-neutral-300 dark:text-neutral-700 mx-auto mb-2.5" />
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  ยังไม่มีประวัติการปัด
                </p>
              </div>
            ) : (
              filteredHistory.map((item, idx) => {
                const title = isCandView ? item.job_title : item.candidate_name;
                const subtitle = isCandView ? item.company_name : item.candidate_title;
                const badge = ACTION_BADGE[item.action] || ACTION_BADGE.skip;
                const score = Math.round(item.match_score || 0);

                return (
                  <div
                    key={item.interaction_id || `${item.candidate_id}_${item.job_id}_${idx}`}
                    className="p-3.5 space-y-2 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111111] dark:text-neutral-100 truncate">
                          {title}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                          {subtitle} · <span className="font-mono-num">{score}% Match</span>
                        </p>
                      </div>
                      <span
                        className={`font-mono-num text-[10px] px-2 py-0.5 rounded border shrink-0 ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onRestoreItem && (
                        <button
                          type="button"
                          onClick={() => onRestoreItem(item)}
                          className="flex-1 py-1.5 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:border-[#111111] dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>นำกลับเข้าคิว</span>
                        </button>
                      )}
                      {item.action !== 'express_interest' && onUpdateAction && (
                        <button
                          type="button"
                          onClick={() => onUpdateAction(item, 'express_interest')}
                          className="flex-1 py-1.5 px-2.5 rounded-md bg-[#111111] dark:bg-white hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white dark:text-[#111111] dark:hover:text-white text-[11px] font-medium inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Heart className="w-3 h-3" />
                          <span>เปลี่ยนเป็นสนใจ</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
        <button
          type="button"
          disabled={isSimulating}
          onClick={onSimulateMatch}
          className="w-full py-2 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-200 hover:text-[#111111] dark:hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>กำลังจำลอง Mutual Match...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>จำลอง Mutual Match (Demo)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function MatchSidebar({ isDrawerOpen, onCloseDrawer, ...props }) {
  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex justify-end"
      onClick={onCloseDrawer}
    >
      <div
        className="w-full max-w-xs sm:max-w-[360px] h-full bg-white dark:bg-[#141416] border-l border-neutral-200 dark:border-neutral-800 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <MatchSidebarContent {...props} showCloseButton={true} onClose={onCloseDrawer} />
      </div>
    </div>
  );
}
