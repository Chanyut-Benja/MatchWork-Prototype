import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Send,
  Sliders,
  Wallet,
} from 'lucide-react';
import RecruiterJobInfoSection from '../components/settings/RecruiterJobInfoSection';
import RecruiterRequirementsSection from '../components/settings/RecruiterRequirementsSection';
import SkillTagsSection from '../components/settings/SkillTagsSection';
import BrandMark from '../components/ui/BrandMark';
import ThemeToggle from '../components/ui/ThemeToggle';
import { profileApi } from '../services/api';

const STEPS = [
  { key: 'info', step: '01', title: 'ข้อมูลตำแหน่งงาน', subtitle: 'บริษัท ตำแหน่ง และรายละเอียด', icon: Briefcase },
  { key: 'requirements', step: '02', title: 'คุณสมบัติและงบประมาณ', subtitle: 'เงินเดือน สัญญาจ้าง สถานที่', icon: Wallet },
  { key: 'skills', step: '03', title: 'สกิลที่ต้องการ', subtitle: 'Skill Tags (0.10 - 1.00)', icon: Sliders },
];

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];

function defaultDeadlineDate() {
  return new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
}

export default function JobPostPage({ user, onBack, onCreated, onNotify }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [companyName, setCompanyName] = useState(user?.company_name || user?.name || '');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [minSalary, setMinSalary] = useState(50000);
  const [maxSalary, setMaxSalary] = useState(90000);
  const [expReq, setExpReq] = useState(2);
  const [workStyle, setWorkStyle] = useState('hybrid');
  const [location, setLocation] = useState('Bangkok, Thailand');
  const [employmentType, setEmploymentType] = useState('full-time');
  const [applicationDeadline, setApplicationDeadline] = useState(defaultDeadlineDate);

  const [allTags, setAllTags] = useState([]);
  const [selectedTagIdToAdd, setSelectedTagIdToAdd] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    let active = true;
    profileApi
      .getAllTags()
      .then((res) => {
        if (!active) return;
        const catalog = res?.tags || res?.data || [];
        setAllTags(catalog);
        if (catalog.length >= 2) {
          setTags([
            { tag_id: catalog[0].tag_id, tag_name: catalog[0].tag_name, weight: 0.9 },
            { tag_id: catalog[1].tag_id, tag_name: catalog[1].tag_name, weight: 0.8 },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoadingTags(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const unusedTags = useMemo(
    () => allTags.filter((t) => !tags.some((st) => Number(st.tag_id) === Number(t.tag_id))),
    [allTags, tags]
  );

  const handleAddTag = () => {
    const tagIdNum = Number(selectedTagIdToAdd || unusedTags[0]?.tag_id);
    if (!tagIdNum) return;
    if (tags.some((t) => Number(t.tag_id) === tagIdNum)) return;
    const found = allTags.find((t) => Number(t.tag_id) === tagIdNum);
    if (!found) return;
    setTags((prev) => [
      ...prev,
      { tag_id: found.tag_id, tag_name: found.tag_name, category: found.category, weight: 0.8 },
    ]);
    setSelectedTagIdToAdd('');
  };

  const handleTagWeightChange = (tagId, weightVal) => {
    const numeric = Math.max(0.1, Math.min(1, Number(weightVal) || 0.1));
    setTags((prev) =>
      prev.map((t) => (Number(t.tag_id) === Number(tagId) ? { ...t, weight: numeric } : t))
    );
  };

  const handleRemoveTag = (tagId) => {
    setTags((prev) => prev.filter((t) => Number(t.tag_id) !== Number(tagId)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim() || !jobTitle.trim()) {
      setStepIndex(0);
      setError('กรุณากรอกชื่อบริษัทและชื่อตำแหน่งงานที่เปิดรับ');
      return;
    }

    if (Number(minSalary) > Number(maxSalary)) {
      setStepIndex(1);
      setError('เงินเดือนต่ำสุดต้องไม่มากกว่าเงินเดือนสูงสุด');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await profileApi.createJob({
        company_name: companyName.trim(),
        title: jobTitle.trim(),
        description: jobDescription.trim(),
        min_salary: Number(minSalary) || 50000,
        max_salary: Number(maxSalary) || 90000,
        experience_years_requirement: Number(expReq) || 0,
        work_style: workStyle === 'on-site' ? 'onsite' : workStyle,
        employment_type: employmentType,
        application_deadline: applicationDeadline || undefined,
        location: location.trim() || 'Bangkok, Thailand',
        tags: tags.map((t) => ({ tag_id: t.tag_id, weight: t.weight })),
      });
      onCreated?.(result);
    } catch (err) {
      const msg = err?.response?.data?.message || 'ไม่สามารถสร้างประกาศงานได้';
      setError(msg);
      onNotify?.('สร้างประกาศงานไม่สำเร็จ', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = STEPS[stepIndex];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] text-[#111111] dark:text-neutral-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 h-14 bg-white dark:bg-[#141416] border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-500 text-xs font-medium text-[#111111] dark:text-neutral-100 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับหน้าหลัก</span>
            </button>
            <span className="hidden sm:inline-block h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
            <div className="hidden sm:flex items-center gap-2">
              <BrandMark size="sm" />
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                · ระบบประกาศรับสมัครงาน
              </span>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1040px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <p className="font-mono-num text-[11px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-medium">
            Job Posting Studio
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#111111] dark:text-white mt-1">
            สร้างประกาศรับสมัครงานใหม่
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            กรอกรายละเอียดตำแหน่งงาน คุณสมบัติ และค่าน้ำหนักทักษะเพื่อจับคู่กับผู้สมัครที่ตรงที่สุด
          </p>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = idx === stepIndex;
            const completed = idx < stepIndex;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStepIndex(idx)}
                className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer flex items-start gap-3 ${
                  active
                    ? 'bg-white dark:bg-[#141416] border-[#111111] dark:border-white shadow-xs'
                    : 'bg-white/60 dark:bg-[#141416]/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                    active
                      ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] border-[#111111] dark:border-white'
                      : completed
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                        : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {completed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-mono-num text-[10px] uppercase tracking-wider text-neutral-400">
                    Step {s.step}
                  </p>
                  <p className="text-xs font-semibold text-[#111111] dark:text-white truncate">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {s.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-7 shadow-xs space-y-6"
        >
          {error && (
            <div className="p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {currentStep.key === 'info' && (
            <RecruiterJobInfoSection
              companyName={companyName}
              setCompanyName={setCompanyName}
              jobTitle={jobTitle}
              setJobTitle={setJobTitle}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
            />
          )}

          {currentStep.key === 'requirements' && (
            <div className="space-y-6">
              <RecruiterRequirementsSection
                minSalary={minSalary}
                setMinSalary={setMinSalary}
                maxSalary={maxSalary}
                setMaxSalary={setMaxSalary}
                expReq={expReq}
                setExpReq={setExpReq}
                workStyle={workStyle}
                setWorkStyle={setWorkStyle}
                location={location}
                setLocation={setLocation}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    ประเภทสัญญาจ้าง (Employment Type)
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
                  >
                    {EMPLOYMENT_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>วันปิดรับสมัคร (Application Deadline)</span>
                  </label>
                  <input
                    type="date"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm font-mono-num text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep.key === 'skills' && (
            isLoadingTags ? (
              <div className="py-12 flex items-center justify-center gap-2 text-xs text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังโหลดรายการทักษะ...</span>
              </div>
            ) : (
              <SkillTagsSection
                isCandidateMode={false}
                tags={tags}
                unusedTags={unusedTags}
                selectedTagIdToAdd={selectedTagIdToAdd}
                setSelectedTagIdToAdd={setSelectedTagIdToAdd}
                onAddTag={handleAddTag}
                onWeightChange={handleTagWeightChange}
                onRemoveTag={handleRemoveTag}
              />
            )
          )}

          {/* Footer Navigation */}
          <div className="pt-5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (stepIndex > 0 ? setStepIndex((i) => i - 1) : onBack())}
              className="px-4 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{stepIndex > 0 ? 'ย้อนกลับ' : 'ยกเลิก'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              {stepIndex < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => i + 1)}
                  className="px-4 py-2 rounded-md bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-[#111111] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>ขั้นตอนถัดไป</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>เผยแพร่ประกาศงาน</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
