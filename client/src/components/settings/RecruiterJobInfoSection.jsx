import { Briefcase, Building2 } from 'lucide-react';

export default function RecruiterJobInfoSection({
  companyName,
  setCompanyName,
  jobTitle,
  setJobTitle,
  jobDescription,
  setJobDescription,
}) {
  return (
    <div className="space-y-5">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-neutral-400">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Step 01 · Job Overview</span>
        </div>
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white mt-1">
          ข้อมูลบริษัทและตำแหน่งงาน
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          ระบุชื่อบริษัท ตำแหน่งงานที่เปิดรับ และรายละเอียดเบื้องต้นสำหรับผู้สมัคร
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            ชื่อบริษัท <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              placeholder="เช่น Tech Innovator Co., Ltd."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            ชื่อตำแหน่งงานที่เปิดรับ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="เช่น Senior React Developer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
          รายละเอียดงาน
        </label>
        <textarea
          rows={5}
          placeholder="อธิบายลักษณะงาน หน้าที่ความรับผิดชอบ และวัฒนธรรมทีมของคุณ..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] transition-colors resize-none"
        />
      </div>
    </div>
  );
}
