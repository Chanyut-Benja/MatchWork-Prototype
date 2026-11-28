import { Briefcase, CalendarClock, Check, Clock, DollarSign, MapPin, UserCheck } from 'lucide-react';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

function getScoreTone(score) {
  if (score >= 80) {
    return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900';
  }
  if (score >= 60) {
    return 'text-[#111111] dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700';
  }
  return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900';
}

export default function JobCard({
  card,
  matchedTagIds = new Set(),
  dragOffset = { x: 0, y: 0 },
  isTop = true,
  stackIndex = 0,
}) {
  if (!card) return null;

  const isJob = card.card_type === 'job';
  const score = Math.round(card.compatibility_score || 0);
  const tags = Array.isArray(card.tags) ? card.tags : [];

  const sortedTags = [...tags].sort((a, b) => {
    const aMatch = matchedTagIds.has(a.tag_id) ? 1 : 0;
    const bMatch = matchedTagIds.has(b.tag_id) ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    return (b.weight || 0) - (a.weight || 0);
  });

  const matchedCount = sortedTags.filter((t) => matchedTagIds.has(t.tag_id)).length;

  const likeOpacity = isTop ? Math.min(1, Math.max(0, (dragOffset.x - 25) / 85)) : 0;
  const passOpacity = isTop ? Math.min(1, Math.max(0, (-dragOffset.x - 25) / 85)) : 0;
  const saveOpacity = isTop ? Math.min(1, Math.max(0, (-dragOffset.y - 35) / 85)) : 0;

  return (
    <article
      className={`rounded-lg border border-neutral-200 dark:border-neutral-800 select-none relative overflow-hidden ${
        stackIndex > 0
          ? 'pointer-events-none bg-neutral-50 dark:bg-[#111113]'
          : 'bg-white dark:bg-[#141416] shadow-sm'
      }`}
    >
      {/* Swipe Direction Stamps */}
      {isTop && (
        <>
          <div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute top-5 left-5 z-20 px-3 py-1 rounded border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-mono-num font-semibold text-sm tracking-widest -rotate-6 bg-white/95 dark:bg-[#141416]/95"
          >
            สนใจ · LIKE
          </div>
          <div
            style={{ opacity: passOpacity }}
            className="pointer-events-none absolute top-5 right-5 z-20 px-3 py-1 rounded border-2 border-red-600 text-red-600 dark:text-red-400 font-mono-num font-semibold text-sm tracking-widest rotate-6 bg-white/95 dark:bg-[#141416]/95"
          >
            ข้าม · PASS
          </div>
          <div
            style={{ opacity: saveOpacity }}
            className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded border-2 border-amber-600 text-amber-700 dark:text-amber-400 font-mono-num font-semibold text-sm tracking-widest bg-white/95 dark:bg-[#141416]/95"
          >
            บันทึก · SAVE
          </div>
        </>
      )}

      {/* Top Strip */}
      <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono-num text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
          {isJob ? (
            <>
              <Briefcase className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>ตำแหน่งงานที่เปิดรับ</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>โปรไฟล์ผู้สมัคร</span>
            </>
          )}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border font-mono-num text-xs font-semibold ${getScoreTone(
            score
          )}`}
        >
          <span>{score}% MATCH</span>
        </span>
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-start gap-3.5">
          <img
            src={card.company_logo || card.avatar || FALLBACK_AVATAR}
            alt={card.title}
            draggable={false}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-md object-cover border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-900"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-[#111111] dark:text-white leading-snug truncate">
              {isJob ? card.title : card.full_name || card.name}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mt-0.5">
              {isJob ? card.company_name : card.title}
            </p>
            {isJob && (card.employment_type || card.is_closing_soon) && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {card.employment_type && (
                  <span className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono-num text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                    {card.employment_type}
                  </span>
                )}
                {card.is_closing_soon && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50 font-mono-num text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    <CalendarClock className="w-3 h-3" />
                    {card.days_until_deadline === 0
                      ? 'ปิดรับสมัครวันนี้'
                      : `ปิดรับใน ${card.days_until_deadline} วัน`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hairline Spec Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-neutral-200 dark:border-neutral-800 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 text-xs">
          <div className="p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> สถานที่
            </p>
            <p className="font-medium text-[#111111] dark:text-neutral-100 truncate mt-0.5">
              {card.location || 'กรุงเทพฯ'}
              {typeof card.distance_km === 'number' && (
                <span className="text-[10px] text-neutral-400 font-mono-num ml-1">
                  ({card.distance_km} กม.)
                </span>
              )}
            </p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">รูปแบบงาน</p>
            <p className="font-medium text-[#111111] dark:text-neutral-100 capitalize mt-0.5">
              {card.work_style || 'hybrid'}
            </p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> ค่าตอบแทน
            </p>
            <p className="font-mono-num font-medium text-[#111111] dark:text-neutral-100 truncate mt-0.5">
              {card.salary_range || card.expected_salary || 'ตามตกลง'}
            </p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> ประสบการณ์
            </p>
            <p className="font-mono-num font-medium text-[#111111] dark:text-neutral-100 mt-0.5">
              {isJob
                ? `${card.experience_requirement ?? 0}+ ปี`
                : `${card.experience_years ?? 0} ปี`}
            </p>
          </div>
        </div>

        {/* Bio / Description */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
          {card.description || card.bio || 'พร้อมร่วมงานและพัฒนาโปรเจกต์เทคโนโลยีร่วมกับทีม'}
        </p>

        {/* Weighted Skill Tags */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              ทักษะและค่าน้ำหนัก (Tag Weights)
            </span>
            {matchedCount > 0 && (
              <span className="font-mono-num text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                ตรงกัน {matchedCount}/{sortedTags.length}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {sortedTags.slice(0, 8).map((tag) => {
              const isMatched = matchedTagIds.has(tag.tag_id);
              return (
                <span
                  key={tag.tag_id || tag.tag_name || tag.name}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border ${
                    isMatched
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300 font-medium'
                      : 'bg-white dark:bg-[#0B0B0C] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {isMatched && (
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <span>{tag.tag_name || tag.name}</span>
                  <span
                    className={`font-mono-num text-[11px] ${
                      isMatched
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {Number(tag.weight || 0.5).toFixed(2)}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
