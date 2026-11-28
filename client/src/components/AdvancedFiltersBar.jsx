import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from 'lucide-react';

const WORK_STYLE_OPTIONS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];

const DISTANCE_OPTIONS = [
  { value: '', label: 'ไม่จำกัดระยะทาง' },
  { value: '10', label: 'ภายใน 10 กม.' },
  { value: '25', label: 'ภายใน 25 กม.' },
  { value: '50', label: 'ภายใน 50 กม.' },
  { value: '100', label: 'ภายใน 100 กม.' },
];

export default function AdvancedFiltersBar({
  filters,
  onChange,
  onReset,
  effectiveRole = 'candidate',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = Object.values(filters || {}).filter(
    (v) => v !== undefined && v !== null && String(v).trim() !== ''
  ).length;

  const updateField = (key, value) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-[480px] w-full mx-auto mb-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-600 text-xs font-medium text-[#111111] dark:text-neutral-100 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
          <span>ตัวกรองแบบละเอียด (Filters)</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-mono-num text-[10px] font-semibold">
              {activeCount}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-2.5 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] shadow-sm space-y-3.5 text-xs">
          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                เงินเดือนขั้นต่ำ (฿)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                placeholder="เช่น 40000"
                value={filters.min_salary}
                onChange={(e) => updateField('min_salary', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[#111111] dark:text-neutral-100 font-mono-num focus:outline-none focus:border-[#111111] dark:focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                เงินเดือนสูงสุด (฿)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                placeholder="เช่น 120000"
                value={filters.max_salary}
                onChange={(e) => updateField('max_salary', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[#111111] dark:text-neutral-100 font-mono-num focus:outline-none focus:border-[#111111] dark:focus:border-neutral-500"
              />
            </div>
          </div>

          {/* Work Style */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              รูปแบบงาน (Work Style)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {WORK_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value || 'all'}
                  type="button"
                  onClick={() => updateField('work_style', opt.value)}
                  className={`py-1.5 px-2 rounded border text-[11px] font-medium transition-colors cursor-pointer ${
                    filters.work_style === opt.value
                      ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] border-[#111111] dark:border-white'
                      : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location & Distance */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                สถานที่ (Location)
              </label>
              <input
                type="text"
                placeholder="เช่น Bangkok, Chiang Mai"
                value={filters.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[#111111] dark:text-neutral-100 focus:outline-none focus:border-[#111111] dark:focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                ระยะทางสูงสุด
              </label>
              <select
                value={filters.max_distance_km}
                onChange={(e) => updateField('max_distance_km', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[#111111] dark:text-neutral-100 focus:outline-none focus:border-[#111111] dark:focus:border-neutral-500"
              >
                {DISTANCE_OPTIONS.map((opt) => (
                  <option key={opt.value || 'any'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience & Employment Type */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                ประสบการณ์ (ปี: ขั้นต่ำ - สูงสุด)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="0"
                  value={filters.min_exp}
                  onChange={(e) => updateField('min_exp', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[#111111] dark:text-neutral-100 font-mono-num focus:outline-none focus:border-[#111111]"
                />
                <span className="text-neutral-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="10"
                  value={filters.max_exp}
                  onChange={(e) => updateField('max_exp', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[#111111] dark:text-neutral-100 font-mono-num focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            {effectiveRole === 'candidate' && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  ประเภทสัญญาจ้าง
                </label>
                <select
                  value={filters.employment_type}
                  onChange={(e) => updateField('employment_type', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[#111111] dark:text-neutral-100 focus:outline-none focus:border-[#111111] dark:focus:border-neutral-500"
                >
                  {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value || 'all'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
