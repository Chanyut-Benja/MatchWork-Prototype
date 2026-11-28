import { Plus, Sliders, Trash2 } from 'lucide-react';

function getWeightLabel(weight) {
  const w = Number(weight);
  if (w >= 0.85) return { text: 'เชี่ยวชาญ / สำคัญมาก', tone: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900' };
  if (w >= 0.6) return { text: 'ชำนาญ / สำคัญ', tone: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900' };
  if (w >= 0.35) return { text: 'ปานกลาง', tone: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900' };
  return { text: 'พื้นฐาน', tone: 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700' };
}

export default function SkillTagsSection({
  isCandidateMode,
  tags,
  unusedTags,
  selectedTagIdToAdd,
  setSelectedTagIdToAdd,
  onAddTag,
  onWeightChange,
  onRemoveTag,
}) {
  return (
    <div className="space-y-5">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-neutral-400">
          <Sliders className="w-3.5 h-3.5" />
          <span>Step 03 · Skill Weights</span>
        </div>
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white mt-1">
          {isCandidateMode
            ? `จัดการ Skill Tags & ค่าน้ำหนักความถนัด (${tags.length})`
            : `สกิลที่ต้องการ & ค่าน้ำหนักความสำคัญ (${tags.length})`}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {isCandidateMode
            ? 'ปรับค่าน้ำหนักตั้งแต่ 0.10 – 1.00 เพื่อบอกระบบว่าทักษะใดคือจุดแข็งหลักของคุณ'
            : 'ปรับค่าน้ำหนักตั้งแต่ 0.10 – 1.00 เพื่อจัดลำดับผู้สมัครที่ตรงกับตำแหน่งงานมากที่สุด'}
        </p>
      </div>

      {/* Add Tag Row */}
      {unusedTags.length > 0 ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedTagIdToAdd || unusedTags[0]?.tag_id || ''}
            onChange={(e) => setSelectedTagIdToAdd(e.target.value)}
            className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
          >
            {unusedTags.map((t) => (
              <option key={t.tag_id} value={t.tag_id}>
                {t.tag_name} ({t.category})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddTag}
            className="px-4 py-2.5 rounded-lg bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-[#111111] text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มแท็ก</span>
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-500 dark:text-neutral-400">
          คุณได้เพิ่มทักษะที่มีทั้งหมดในระบบแล้ว
        </div>
      )}

      {/* Tag Sliders */}
      {tags.length === 0 ? (
        <div className="py-10 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
          ยังไม่มีสกิลแท็ก กรุณาเลือกและกด "เพิ่มแท็ก" ด้านบน
        </div>
      ) : (
        <div className="space-y-2.5">
          {tags.map((t) => {
            const badge = getWeightLabel(t.weight);
            return (
              <div
                key={t.tag_id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between sm:w-44 shrink-0 gap-2">
                  <span className="text-sm font-semibold text-[#111111] dark:text-white truncate">
                    {t.tag_name}
                  </span>
                  <span
                    className={`sm:hidden px-2 py-0.5 rounded border text-[10px] font-medium ${badge.tone}`}
                  >
                    {badge.text}
                  </span>
                </div>

                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={t.weight}
                    onChange={(e) => onWeightChange(t.tag_id, e.target.value)}
                    className="flex-1 accent-[#111111] dark:accent-white cursor-pointer"
                  />
                  <span className="font-mono-num text-xs font-bold text-[#111111] dark:text-white w-11 text-right">
                    {Number(t.weight).toFixed(2)}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-medium w-32 text-center ${badge.tone}`}
                  >
                    {badge.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveTag(t.tag_id)}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                    aria-label={`ลบแท็ก ${t.tag_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="sm:hidden flex justify-end">
                  <button
                    type="button"
                    onClick={() => onRemoveTag(t.tag_id)}
                    className="text-xs text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบแท็ก</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
