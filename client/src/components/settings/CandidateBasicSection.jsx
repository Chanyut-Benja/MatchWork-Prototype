import { useRef } from 'react';
import {
  Briefcase,
  Code2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function CandidateBasicSection({
  fullName,
  setFullName,
  title,
  setTitle,
  email,
  setEmail,
  location,
  setLocation,
  bio,
  setBio,
  portfolioUrl,
  setPortfolioUrl,
  githubUrl,
  setGithubUrl,
  linkedinUrl,
  setLinkedinUrl,
  resumeFilename,
  setResumeFilename,
  setResumeData,
  onlineResume,
  setOnlineResume,
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(t('ไฟล์ Resume ต้องมีขนาดไม่เกิน 5 MB', 'Resume file must be 5 MB or smaller'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setResumeFilename(file.name);
      setResumeData(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    setResumeFilename('');
    setResumeData('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateOnlineResume = (field, value) => {
    setOnlineResume((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-neutral-400">
          <User className="w-3.5 h-3.5" />
          <span>Step 01 · Profile & Resume</span>
        </div>
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white mt-1">
          {t('ข้อมูลส่วนตัว โปรไฟล์และเรซูเม่', 'Personal Info, Resume & Links')}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t(
            'ข้อมูลพื้นฐาน ลิงก์ผลงาน และไฟล์ Resume / โปรไฟล์ออนไลน์ที่บริษัทจะเห็น',
            'Basic profile details, portfolio links, and your Resume/CV or online profile'
          )}
        </p>
      </div>

      {/* Personal Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            {t('ชื่อ-นามสกุล', 'Full Name')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="เช่น สมชาย ใจดี"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            {t('ตำแหน่งงาน (Title)', 'Job Title')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="เช่น Full Stack Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            {t('อีเมลติดต่อ', 'Contact Email')}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            {t('พื้นที่ / จังหวัด', 'Location')}
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="เช่น Bangkok, Thailand"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
          {t('แนะนำตัวสั้นๆ (Bio)', 'Short Bio')}
        </label>
        <textarea
          rows={3}
          placeholder={t(
            'เล่าประสบการณ์ จุดเด่น หรือสิ่งที่กำลังมองหาในงานถัดไป...',
            'Share your experience, strengths, and what you are looking for...'
          )}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] transition-colors resize-none"
        />
      </div>

      {/* Portfolio / GitHub / LinkedIn Links */}
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {t('ลิงก์ผลงานและโซเชียล', 'Portfolio / GitHub / LinkedIn')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
              Portfolio URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                placeholder="https://yourportfolio.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
              GitHub
            </label>
            <div className="relative">
              <Code2 className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
              LinkedIn
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resume / CV Upload & Online Profile Builder */}
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t('เรซูเม่ / โปรไฟล์ออนไลน์ (Resume & Online CV)', 'Resume / CV & Online Profile')}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {t(
                'อัปโหลดไฟล์ PDF/DOCX หรือกรอกโปรไฟล์ออนไลน์เพื่อให้ HR อ่านได้ทันที',
                'Upload a PDF/DOCX file or fill out your online profile'
              )}
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#111111] dark:text-neutral-200" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#111111] dark:text-white truncate">
                {resumeFilename || t('ยังไม่ได้อัปโหลดไฟล์ Resume/CV', 'No Resume/CV file uploaded')}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {t('รองรับ PDF, DOC, DOCX (ไม่เกิน 5 MB)', 'Supports PDF, DOC, DOCX (max 5 MB)')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-500 text-xs font-medium text-[#111111] dark:text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{resumeFilename ? t('เปลี่ยนไฟล์', 'Replace') : t('อัปโหลดไฟล์', 'Upload File')}</span>
            </button>
            {resumeFilename && (
              <button
                type="button"
                onClick={handleRemoveResume}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-rose-300 dark:hover:border-rose-800 text-neutral-500 hover:text-rose-600 cursor-pointer"
                title={t('ลบไฟล์', 'Remove file')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Online Profile Builder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
              {t('การศึกษา (Education)', 'Education')}
            </label>
            <input
              type="text"
              placeholder={t('เช่น วท.บ. วิทยาการคอมพิวเตอร์', 'e.g. B.Sc. Computer Science')}
              value={onlineResume?.education || ''}
              onChange={(e) => updateOnlineResume('education', e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
              {t('ใบรับรอง / รางวัล (Certifications)', 'Certifications')}
            </label>
            <input
              type="text"
              placeholder="e.g. AWS Certified Developer"
              value={onlineResume?.certifications || ''}
              onChange={(e) => updateOnlineResume('certifications', e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
              {t('สรุปประสบการณ์ทำงาน (Work Highlights)', 'Work Experience Highlights')}
            </label>
            <textarea
              rows={2}
              placeholder={t(
                'สรุปโปรเจกต์เด่น หรือหน้าที่ความรับผิดชอบที่ผ่านมา...',
                'Key projects, achievements, or past roles...'
              )}
              value={onlineResume?.highlights || ''}
              onChange={(e) => updateOnlineResume('highlights', e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
