export default function BrandMark({ size = 'md', showWordmark = true }) {
  const boxSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${boxSize} bg-[#111111] dark:bg-white text-white dark:text-[#111111] flex items-center justify-center rounded-md border border-[#111111] dark:border-white`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <rect x="3" y="4" width="8" height="16" fill="currentColor" />
          <rect x="13" y="4" width="8" height="8" fill="#10B981" />
          <rect x="13" y="14" width="8" height="6" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex items-baseline gap-1.5">
          <span className="font-semibold tracking-tight text-[#111111] dark:text-neutral-100 text-base">
            MatchWork
          </span>
          <span className="font-mono-num text-[10px] uppercase tracking-widest text-neutral-400">
            v2
          </span>
        </div>
      )}
    </div>
  );
}
