import { useRef, useState } from 'react';
import { Bookmark, CheckCircle2, Heart, Loader2, RefreshCw, RotateCcw, X } from 'lucide-react';
import JobCard from './JobCard';

const SWIPE_THRESHOLD_X = 95;
const SWIPE_THRESHOLD_Y = -95;

export default function SwipeDeck({
  cards = [],
  matchedTagIds = new Set(),
  isLoading = false,
  error = '',
  isActing = false,
  canUndo = false,
  onSwipe,
  onUndo,
  onReset,
  onRetry,
}) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyOut, setFlyOut] = useState(null);
  const startPointRef = useRef(null);

  const currentCard = cards[0] || null;
  const nextCard = cards[1] || null;

  const triggerSwipeWithAnimation = (action) => {
    if (!currentCard || isActing || flyOut) return;

    let target = { x: 0, y: 0, rotate: 0 };
    if (action === 'skip') target = { x: -420, y: 30, rotate: -10 };
    else if (action === 'express_interest') target = { x: 420, y: 30, rotate: 10 };
    else if (action === 'save') target = { x: 0, y: -360, rotate: 0 };

    setIsDragging(false);
    setFlyOut(target);

    setTimeout(() => {
      setFlyOut(null);
      setDragOffset({ x: 0, y: 0 });
      onSwipe(action, currentCard);
    }, 220);
  };

  const handlePointerDown = (e) => {
    if (!currentCard || isActing || flyOut) return;
    if (e.target.closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startPointRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !startPointRef.current) return;
    setDragOffset({
      x: e.clientX - startPointRef.current.x,
      y: e.clientY - startPointRef.current.y,
    });
  };

  const handlePointerEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    startPointRef.current = null;

    if (dragOffset.x > SWIPE_THRESHOLD_X) {
      triggerSwipeWithAnimation('express_interest');
    } else if (dragOffset.x < -SWIPE_THRESHOLD_X) {
      triggerSwipeWithAnimation('skip');
    } else if (dragOffset.y < SWIPE_THRESHOLD_Y && Math.abs(dragOffset.x) < 70) {
      triggerSwipeWithAnimation('save');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[480px] mx-auto bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-12 flex flex-col items-center justify-center gap-3 min-h-[380px]">
        <Loader2 className="w-6 h-6 text-[#111111] dark:text-neutral-100 animate-spin" />
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          กำลังคำนวณและจัดเรียงรายการที่ตรงกับคุณ...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[480px] mx-auto bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 text-center">
        <p className="text-sm font-semibold text-[#111111] dark:text-white mb-1">
          ไม่สามารถโหลดข้อมูลได้
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-md bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-[#111111] text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="w-full max-w-[480px] mx-auto bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-10 text-center">
        <div className="w-10 h-10 rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[#111111] dark:text-white mb-1.5">
          ดูรายการครบทั้งหมดแล้ว
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
          คุณได้พิจารณาการ์ดทั้งหมดในคิวแล้ว สามารถรีเซ็ตเพื่อดูรายการใหม่อีกครั้ง หรือย้อนกลับรายการล่าสุดได้
        </p>
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          {canUndo && onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={isActing}
              className="px-4 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-500 text-[#111111] dark:text-neutral-100 text-xs font-medium inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ย้อนกลับล่าสุด (Undo)
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            disabled={isActing}
            className="px-4 py-2 rounded-md bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-[#111111] text-xs font-medium inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            รีเซ็ตคิวและดูใหม่
          </button>
        </div>
      </div>
    );
  }

  const activeTransform = flyOut
    ? `translate3d(${flyOut.x}px, ${flyOut.y}px, 0) rotate(${flyOut.rotate}deg)`
    : `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.035}deg)`;

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-2.5 px-0.5">
        <span>ลากการ์ดหรือกดปุ่มด้านล่าง</span>
        <div className="flex items-center gap-3">
          {canUndo && onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={isActing || Boolean(flyOut)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white cursor-pointer disabled:opacity-40"
              title="ย้อนกลับการปัดล่าสุด (Z)"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ย้อนกลับ</span>
            </button>
          )}
          <span className="font-mono-num">เหลือในคิว {cards.length} รายการ</span>
        </div>
      </div>

      <div className="relative w-full min-h-[410px]">
        {nextCard && (
          <div
            className="absolute inset-x-0 top-0 transition-transform duration-200"
            style={{
              transform: 'scale(0.97) translateY(10px)',
              opacity: 0.55,
              zIndex: 1,
            }}
          >
            <JobCard card={nextCard} matchedTagIds={matchedTagIds} isTop={false} stackIndex={1} />
          </div>
        )}

        <div
          key={currentCard.id}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={{
            transform: activeTransform,
            opacity: flyOut ? 0 : 1,
            transition: isDragging
              ? 'none'
              : 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease',
            zIndex: 10,
            touchAction: 'none',
          }}
          className="relative cursor-grab active:cursor-grabbing"
        >
          <JobCard
            card={currentCard}
            matchedTagIds={matchedTagIds}
            dragOffset={dragOffset}
            isTop={true}
            stackIndex={0}
          />
        </div>
      </div>

      {/* Editorial Action Bar */}
      <div className="w-full grid grid-cols-3 gap-2.5 mt-5">
        <button
          type="button"
          disabled={isActing || Boolean(flyOut)}
          onClick={() => triggerSwipeWithAnimation('skip')}
          className="py-2.5 px-3 rounded-md bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50/40 dark:hover:bg-red-950/30 text-neutral-700 dark:text-neutral-200 hover:text-red-700 dark:hover:text-red-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          title="ข้าม (Pass)"
        >
          <X className="w-4 h-4" />
          <span>ข้าม</span>
        </button>

        <button
          type="button"
          disabled={isActing || Boolean(flyOut)}
          onClick={() => triggerSwipeWithAnimation('save')}
          className="py-2.5 px-3 rounded-md bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 text-neutral-700 dark:text-neutral-200 hover:text-amber-700 dark:hover:text-amber-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          title="บันทึกไว้ดูภายหลัง (Save)"
        >
          <Bookmark className="w-4 h-4" />
          <span>บันทึก</span>
        </button>

        <button
          type="button"
          disabled={isActing || Boolean(flyOut)}
          onClick={() => triggerSwipeWithAnimation('express_interest')}
          className="py-2.5 px-3 rounded-md bg-[#111111] dark:bg-white hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white dark:text-[#111111] dark:hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          title="สนใจ (Like)"
        >
          <Heart className="w-4 h-4" />
          <span>สนใจ</span>
        </button>
      </div>
    </div>
  );
}
