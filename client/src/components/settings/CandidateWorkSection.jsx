import { Briefcase, Building2, Globe, Home } from 'lucide-react';

const WORK_STYLE_OPTIONS = [
  {
    value: 'hybrid',
    label: 'Hybrid',
    desc: 'เข้าออฟฟิศบางวัน + ทำงานที่บ้านได้',
    icon: Building2,
  },
  {
    value: 'remote',
    label: 'Remote',
    desc: 'ทำงานจากที่ไหนก็ได้ 100%',
    icon: Globe,
  },
  {
    value: 'on-site',
    label: 'On-site',
    desc: 'เข้าทำงานที่ออฟฟิศเป็นหลัก',
    icon: Home,
  },
];

export default function CandidateWorkSection({
  experienceYears,
  setExperienceYears,
  expectedSalary,
  setExpectedSalary,
  workStyle,
  setWorkStyle,
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-neutral-400">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Step 02 · Work & Compensation</span>
        </div>
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white mt-1">
          ประสบการณ์และรูปแบบการทำงาน
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          ใช้สำหรับจับคู่ตำแหน่งงานที่มีระดับประสบการณ์ เงินเดือน และรูปแบบงานตรงกับคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            ประสบการณ์ทำงาน (ปี)
          </label>
          <input
            type="number"
            min="0"
            max="60"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="w-full bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm font-mono-num text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
          />
          <p className="text-[11px] text-neutral-400 mt-1.5">ระบุ 0 หากเป็นนักศึกษาจบใหม่</p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            เงินเดือนที่คาดหวัง (บาท/เดือน)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={expectedSalary}
            onChange={(e) => setExpectedSalary(e.target.value)}
            className="w-full bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm font-mono-num text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
          />
          <p className="text-[11px] text-neutral-400 mt-1.5">
            {Number(expectedSalary || 0).toLocaleString()} บาท / เดือน
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2.5">
          รูปแบบการทำงานที่ต้องการ
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WORK_STYLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = workStyle === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWorkStyle(opt.value)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'border-[#111111] dark:border-white bg-neutral-100/80 dark:bg-neutral-800/80 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-[#111111] dark:text-white">
                    {opt.label}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      active ? 'text-[#111111] dark:text-white' : 'text-neutral-400'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
