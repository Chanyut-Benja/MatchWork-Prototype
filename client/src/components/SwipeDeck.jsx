import { useRef, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Heart,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import JobCard from './JobCard';

const SWIPE_THRESHOLD_X = 95;
const SWIPE_THRESHOLD_Y = -95;

export default function SwipeDeck({
  cards = [],
  matchedTagIds = new Set(),
  isLoading = false,
  error = '',
  isActing = false,
  onSwipe,
  onReset,
  onRetry,
}) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyOut, setFlyOut] = useState(null); // { x, y, rotate } | null
  const startPointRef = useRef(null);

  const currentCard = cards[0] || null;
  const nextCard = cards[1] || null;

  const triggerSwipeWithAnimation = (action) => {
    if (!currentCard || isActing || flyOut) return;

    let target = { x: 0, y: 0, rotate: 0 };
    if (action === 'skip') target = { x: -420, y: 40, rotate: -18 };
    else if (action === 'express_interest') target = { x: 420, y: 40, rotate: 18 };
    else if (action === 'save') target = { x: 0, y: -380, rotate: 0 };

    setIsDragging(false);
    setFlyOut(target);

    setTimeout(() => {
      setFlyOut(null);
      setDragOffset({ x: 0, y: 0 });
      onSwipe(action, currentCard);
    }, 240);
  };

  const handlePointerDown = (e) => {
    if (!currentCard || isActing || flyOut) return;
    // Ignore clicks on buttons inside the card if any
    if (e.target.closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startPointRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !startPointRef.current) return;
    const dx = e.clientX - startPointRef.current.x;
    const dy = e.clientY - startPointRef.current.y;
    setDragOffset({ x: dx, y: dy });
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
      <div className="bg-white rounded-3xl border border-slate-200 p-12 shadow-xl shadow-slate-900/5 flex flex-col items-center justify-center min-h-[420px] w-full">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">กำลังคำนวณคะแนนจับคู่...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-lg w-full">
        <p className="text-sm font-semibold text-rose-600 mb-3">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold cursor-pointer"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center shadow-xl shadow-slate-900/5 min-h-[380px] flex flex-col items-center justify-center w-full">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900">ปัดการ์ดครบทั้งหมดแล้ว!</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xs">
          คุณดูการ์ดทั้งหมดในฟีดนี้เรียบร้อยแล้ว สามารถกดรีเซ็ตเพื่อทดสอบปัดใหม่ได้
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-6 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>รีเซ็ตการ์ดทั้งหมด (Reset Feed)</span>
        </button>
      </div>
    );
  }

  const activeTransform = flyOut
    ? `translate3d(${flyOut.x}px, ${flyOut.y}px, 0) rotate(${flyOut.rotate}deg)`
    : `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.05}deg)`;

  return (
    <div className="w-full">
      {/* Stacked Cards Container */}
      <div className="relative w-full">
        {/* Next Card Preview (Behind) */}
        {nextCard && (
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-y-3 scale-[0.96] opacity-60 pointer-events-none transition-transform duration-300"
          >
            <JobCard
              card={nextCard}
              matchedTagIds={matchedTagIds}
              isTop={false}
              stackIndex={1}
            />
          </div>
        )}

        {/* Top Draggable Card */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={{
            transform: activeTransform,
            opacity: flyOut ? 0 : 1,
            transition: isDragging
              ? 'none'
              : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease',
            touchAction: 'pan-y',
          }}
          className={`relative z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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

      {/* Bottom Action Controls */}
      <div className="mt-6 flex items-center justify-center gap-5">
        <button
          type="button"
          disabled={isActing || Boolean(flyOut)}
          onClick={() => triggerSwipeWithAnimation('skip')}
          className="w-14 h-14 rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 flex items-center justify-center shadow-md transition active:scale-90 cursor-pointer disabled:opacity-50"
          title="ปัดซ้าย: ข้าม (Pass) [←]"
          aria-label="Pass"
        >
          <X className="w-6 h-6" />
        </button>

        <button
          type="button"
          disabled={isActing || Boolean(flyOut)}
          onClick={() => triggerSwipeWithAnimation('save')}
          className="w-12 h-12 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center shadow-md transition active:scale-90 cursor-pointer disabled:opacity-50"
          title="ปัดขึ้น: บันทึกไว้ (Save) [↑]"
          aria-label="Save"
        >
          <Bookmark className="w-5 h-5" />
        </button>

        <button
          type="button"
          disabled={isActing || Boolean(flyOut)}
          onClick={() => triggerSwipeWithAnimation('express_interest')}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#2563EB] via-[#4F46E5] to-[#EC4899] text-white flex items-center justify-center shadow-xl shadow-blue-600/25 hover:scale-105 transition active:scale-90 cursor-pointer disabled:opacity-50"
          title="ปัดขวา: สนใจ / จับคู่ (Like) [→]"
          aria-label="Like"
        >
          <Heart className="w-7 h-7 fill-white" />
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-400 mt-3">
        ลากการ์ดซ้าย/ขวา หรือใช้คีย์ลัด: ← ข้าม • ↑ บันทึก • → สนใจ
      </p>
    </div>
  );
}
