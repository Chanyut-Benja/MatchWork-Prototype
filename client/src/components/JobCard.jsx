import {
  Briefcase,
  Check,
  Clock,
  DollarSign,
  MapPin,
  Sparkles,
  UserCheck,
} from 'lucide-react';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

function getScoreBadgeClasses(score) {
  if (score >= 80) {
    return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  }
  if (score >= 60) {
    return 'bg-blue-50 border-blue-200 text-blue-700';
  }
  return 'bg-amber-50 border-amber-200 text-amber-700';
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

  // Sort tags so matched tags appear first
  const sortedTags = [...tags].sort((a, b) => {
    const aMatch = matchedTagIds.has(a.tag_id) ? 1 : 0;
    const bMatch = matchedTagIds.has(b.tag_id) ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    return (b.weight || 0) - (a.weight || 0);
  });

  const matchedCount = sortedTags.filter((t) => matchedTagIds.has(t.tag_id)).length;

  // Stamp opacity based on drag distance
  const likeOpacity = isTop ? Math.min(1, Math.max(0, (dragOffset.x - 25) / 85)) : 0;
  const passOpacity = isTop ? Math.min(1, Math.max(0, (-dragOffset.x - 25) / 85)) : 0;
  const saveOpacity = isTop
    ? Math.min(1, Math.max(0, (-dragOffset.y - 35) / 85))
    : 0;

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xl shadow-slate-900/10 select-none relative overflow-hidden ${
        stackIndex > 0 ? 'pointer-events-none' : ''
      }`}
    >
      {/* Swipe Direction Stamps */}
      {isTop && (
        <>
          <div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute top-6 left-6 z-20 px-4 py-1.5 rounded-xl border-4 border-emerald-500 text-emerald-600 font-black text-xl tracking-widest -rotate-12 bg-white/90 shadow-lg"
          >
            LIKE
          </div>
          <div
            style={{ opacity: passOpacity }}
            className="pointer-events-none absolute top-6 right-6 z-20 px-4 py-1.5 rounded-xl border-4 border-rose-500 text-rose-600 font-black text-xl tracking-widest rotate-12 bg-white/90 shadow-lg"
          >
            PASS
          </div>
          <div
            style={{ opacity: saveOpacity }}
            className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-xl border-4 border-amber-500 text-amber-600 font-black text-lg tracking-widest bg-white/90 shadow-lg"
          >
            SAVE
          </div>
        </>
      )}

      {/* Header: Avatar/Logo + Title + % Match Score Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={card.company_logo || card.avatar || FALLBACK_AVATAR}
            alt={card.title}
            draggable={false}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0 bg-slate-100"
          />
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {isJob ? (
                <>
                  <Briefcase className="w-3 h-3" />
                  <span>Job Opportunity</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3" />
                  <span>Tech Candidate</span>
                </>
              )}
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug truncate">
              {isJob ? card.title : card.full_name || card.name}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">
              {isJob ? card.company_name : card.title}
            </p>
          </div>
        </div>

        {/* % Match Score Badge */}
        <div className="shrink-0">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-extrabold shadow-xs ${getScoreBadgeClasses(
              score
            )}`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{score}% Match</span>
          </div>
        </div>
      </div>

      {/* Metadata Pills */}
      <div className="flex flex-wrap gap-2 mt-4 text-[11px] sm:text-xs text-slate-600">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-medium">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate max-w-[140px]">{card.location || 'Bangkok'}</span>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 font-medium capitalize">
          {card.work_style || 'hybrid'}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
          <DollarSign className="w-3.5 h-3.5 shrink-0" />
          <span>{card.salary_range || card.expected_salary || 'Negotiable'}</span>
        </span>
        {(card.experience_requirement !== undefined || card.experience_years !== undefined) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {isJob
                ? `${card.experience_requirement}+ ปี`
                : `Exp ${card.experience_years} ปี`}
            </span>
          </span>
        )}
      </div>

      {/* Description / Bio */}
      <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
        {card.description ||
          card.bio ||
          'พร้อมร่วมงานและพัฒนาโปรเจกต์เทคโนโลยีร่วมกับทีม'}
      </p>

      {/* Weighted Skill Tags with Matched Tags Highlighted */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Skill Tags & Weights
          </span>
          {matchedCount > 0 && (
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              ตรงกัน {matchedCount} สกิล
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sortedTags.slice(0, 8).map((tag) => {
            const isMatched = matchedTagIds.has(tag.tag_id);
            return (
              <span
                key={tag.tag_id || tag.tag_name || tag.name}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {isMatched && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                <span>{tag.tag_name || tag.name}</span>
                <span className={isMatched ? 'text-emerald-700 font-bold' : 'text-blue-600 font-bold'}>
                  ({Number(tag.weight || 0.5).toFixed(2)})
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
