import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Briefcase,
  Loader2,
  Monitor,
  Save,
  Settings,
  Shield,
  Sliders,
  User,
  Wallet,
} from 'lucide-react';
import AppearanceSettingsSection from '../components/settings/AppearanceSettingsSection';
import CandidateBasicSection from '../components/settings/CandidateBasicSection';
import CandidateWorkSection from '../components/settings/CandidateWorkSection';
import NotificationSettingsSection from '../components/settings/NotificationSettingsSection';
import RecruiterJobInfoSection from '../components/settings/RecruiterJobInfoSection';
import RecruiterRequirementsSection from '../components/settings/RecruiterRequirementsSection';
import SecuritySettingsSection from '../components/settings/SecuritySettingsSection';
import SkillTagsSection from '../components/settings/SkillTagsSection';
import BrandMark from '../components/ui/BrandMark';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useLanguage } from '../context/LanguageContext';
import { profileApi, settingsApi } from '../services/api';

const ACCOUNT_SECTION_KEYS = new Set(['notifications', 'security', 'appearance']);

export default function ProfileSettingsPage({
  effectiveRole,
  activePersonaId,
  setActivePersonaId,
  isAdmin,
  personaOptions = [],
  user,
  activeSection,
  onNavigateSection,
  onBack,
  onSaved,
  onNotify,
}) {
  const { t } = useLanguage();
  const isCandidateMode = effectiveRole === 'candidate';

  const sections = useMemo(() => {
    const accountSections = [
      {
        key: 'notifications',
        step: '04',
        title: t('การแจ้งเตือน', 'Notifications'),
        subtitle: t('Email, Push และในแอป', 'Email, Push & In-App'),
        icon: Bell,
      },
      {
        key: 'security',
        step: '05',
        title: t('ความปลอดภัย', 'Security'),
        subtitle: t('เปลี่ยนรหัสผ่านบัญชี', 'Change password'),
        icon: Shield,
      },
      {
        key: 'appearance',
        step: '06',
        title: t('การแสดงผลและภาษา', 'Appearance & Language'),
        subtitle: t('ไทย / EN และ Dark / Light', 'Language & Theme'),
        icon: Monitor,
      },
    ];

    if (isCandidateMode) {
      return [
        {
          key: 'profile',
          step: '01',
          title: t('โปรไฟล์และเรซูเม่', 'Profile & Resume'),
          subtitle: t('ข้อมูลส่วนตัว, Resume & ลิงก์', 'Personal info, CV & Links'),
          icon: User,
        },
        {
          key: 'preferences',
          step: '02',
          title: t('งานและค่าตอบแทน', 'Work & Salary'),
          subtitle: t('ประสบการณ์ เงินเดือน รูปแบบงาน', 'Experience, salary & style'),
          icon: Briefcase,
        },
        {
          key: 'skills',
          step: '03',
          title: t('ทักษะและค่าน้ำหนัก', 'Skills & Weights'),
          subtitle: 'Skill Tags (0.10 - 1.00)',
          icon: Sliders,
        },
        ...accountSections,
      ];
    }

    return [
      {
        key: 'job-info',
        step: '01',
        title: t('ข้อมูลตำแหน่งงาน', 'Job Posting Info'),
        subtitle: t('บริษัท ตำแหน่ง และรายละเอียด', 'Company, title & description'),
        icon: Briefcase,
      },
      {
        key: 'job-requirements',
        step: '02',
        title: t('คุณสมบัติและงบประมาณ', 'Requirements & Budget'),
        subtitle: t('เงินเดือน ประสบการณ์ สถานที่', 'Salary, experience & location'),
        icon: Wallet,
      },
      {
        key: 'job-skills',
        step: '03',
        title: t('สกิลที่ต้องการ', 'Required Skills'),
        subtitle: 'Skill Tags (0.10 - 1.00)',
        icon: Sliders,
      },
      ...accountSections,
    ];
  }, [isCandidateMode, t]);

  const resolvedSection = useMemo(() => {
    const found = sections.find((s) => s.key === activeSection);
    return found ? found.key : sections[0].key;
  }, [sections, activeSection]);

  const isAccountSection = ACCOUNT_SECTION_KEYS.has(resolvedSection);
  const currentStepIndex = sections.findIndex((s) => s.key === resolvedSection);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [error, setError] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTagIdToAdd, setSelectedTagIdToAdd] = useState('');

  // Candidate Profile & Resume state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [expectedSalary, setExpectedSalary] = useState(65000);
  const [workStyle, setWorkStyle] = useState('hybrid');
  const [location, setLocation] = useState('Bangkok, Thailand');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFilename, setResumeFilename] = useState('');
  const [resumeData, setResumeData] = useState('');
  const [onlineResume, setOnlineResume] = useState({
    education: '',
    certifications: '',
    highlights: '',
  });
  const [tags, setTags] = useState([]);

  // Recruiter / Company Job Posting state
  const [companyName, setCompanyName] = useState(user?.company_name || user?.name || '');
  const [jobTitle, setJobTitle] = useState('');
  const [minSalary, setMinSalary] = useState(50000);
  const [maxSalary, setMaxSalary] = useState(90000);
  const [expReq, setExpReq] = useState(2);
  const [jobDescription, setJobDescription] = useState('');

  // Account Settings state (Notifications)
  const [notificationPrefs, setNotificationPrefs] = useState({
    channels: { email: true, push: true, in_app: true },
    events: { new_matching_job: true, new_match: true, hr_reply: true },
  });

  useEffect(() => {
    let active = true;
    setError('');
    setIsLoading(true);

    async function loadData() {
      try {
        const [tagsRes, accountRes] = await Promise.all([
          profileApi.getAllTags(),
          settingsApi.getAccountSettings().catch(() => null),
        ]);

        const availableTags = tagsRes?.data || [];
        if (active) setAllTags(availableTags);

        if (active && accountRes?.success && accountRes?.data) {
          const acc = accountRes.data;
          if (acc.notification_preferences) {
            setNotificationPrefs(acc.notification_preferences);
          }
        }

        if (isCandidateMode) {
          const profRes = await profileApi.getCandidateTags(activePersonaId);
          if (!active) return;
          const p = profRes?.profile || {};
          setFullName(p.full_name || user?.name || '');
          setEmail(p.email || user?.email || '');
          setTitle(p.title || user?.title || '');
          setExperienceYears(p.experience_years ?? 3);
          setExpectedSalary(p.expected_salary ?? 65000);
          setWorkStyle(p.work_style || 'hybrid');
          setLocation(p.location || 'Bangkok, Thailand');
          setBio(p.bio || '');
          setPortfolioUrl(p.portfolio_url || '');
          setGithubUrl(p.github_url || '');
          setLinkedinUrl(p.linkedin_url || '');
          setResumeFilename(p.resume_filename || '');
          setResumeData(p.resume_data || '');
          let parsedOnline = { education: '', certifications: '', highlights: '' };
          if (p.online_resume) {
            try {
              parsedOnline =
                typeof p.online_resume === 'string'
                  ? JSON.parse(p.online_resume)
                  : p.online_resume;
            } catch {
              // keep default
            }
          }
          setOnlineResume({
            education: parsedOnline?.education || '',
            certifications: parsedOnline?.certifications || '',
            highlights: parsedOnline?.highlights || '',
          });
          setTags(
            (profRes?.tags || []).map((tItem) => ({
              tag_id: tItem.tag_id,
              tag_name: tItem.tag_name || tItem.name,
              weight: Number(tItem.weight || 0.8),
            }))
          );
        } else {
          setCompanyName(user?.company_name || user?.name || 'Tech Innovator Co., Ltd.');
          setJobTitle('');
          setMinSalary(55000);
          setMaxSalary(95000);
          setExpReq(2);
          setWorkStyle('hybrid');
          setLocation('Bangkok, Thailand');
          setJobDescription('');
          setTags(
            availableTags.slice(0, 3).map((tItem) => ({
              tag_id: tItem.tag_id,
              tag_name: tItem.tag_name,
              weight: 0.85,
            }))
          );
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || t('ไม่สามารถโหลดข้อมูลการตั้งค่าได้', 'Failed to load settings'));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [isCandidateMode, activePersonaId, user, t]);

  const unusedTags = useMemo(() => {
    const usedIds = new Set(tags.map((tItem) => Number(tItem.tag_id)));
    return allTags.filter((tItem) => !usedIds.has(Number(tItem.tag_id)));
  }, [allTags, tags]);

  const handleAddTag = () => {
    const idNum = Number(selectedTagIdToAdd || unusedTags[0]?.tag_id);
    if (!idNum) return;
    const found = allTags.find((tItem) => Number(tItem.tag_id) === idNum);
    if (!found) return;
    setTags((prev) => [
      ...prev,
      { tag_id: found.tag_id, tag_name: found.tag_name, weight: 0.8 },
    ]);
    setSelectedTagIdToAdd('');
  };

  const handleTagWeightChange = (tagId, weight) => {
    setTags((prev) =>
      prev.map((tItem) => (tItem.tag_id === tagId ? { ...tItem, weight: Number(weight) } : tItem))
    );
  };

  const handleRemoveTag = (tagId) => {
    setTags((prev) => prev.filter((tItem) => tItem.tag_id !== tagId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAccountSection) return;
    setError('');

    if (isCandidateMode) {
      if (!fullName.trim() || !title.trim()) {
        onNavigateSection('profile');
        setError(t('กรุณากรอกชื่อ-นามสกุล และตำแหน่งงานให้ครบถ้วน', 'Please enter full name and job title'));
        return;
      }
    } else {
      if (!companyName.trim() || !jobTitle.trim()) {
        onNavigateSection('job-info');
        setError(t('กรุณากรอกชื่อบริษัท และชื่อตำแหน่งงานที่เปิดรับให้ครบถ้วน', 'Please enter company name and job title'));
        return;
      }
    }

    setIsSaving(true);
    try {
      const cleanedTags = tags.map((tItem) => ({
        tag_id: Number(tItem.tag_id),
        weight: Number(tItem.weight),
      }));

      if (isCandidateMode) {
        await profileApi.saveSeekerProfile({
          candidate_id: activePersonaId,
          full_name: fullName.trim(),
          email: email.trim(),
          title: title.trim(),
          experience_years: Number(experienceYears),
          expected_salary: Number(expectedSalary),
          work_style: workStyle,
          location: location.trim(),
          bio: bio.trim(),
          portfolio_url: portfolioUrl.trim(),
          github_url: githubUrl.trim(),
          linkedin_url: linkedinUrl.trim(),
          resume_filename: resumeFilename,
          resume_data: resumeData,
          online_resume: JSON.stringify(onlineResume),
          tags: cleanedTags,
        });
        await profileApi.updateCandidateTags(activePersonaId, cleanedTags);
        onSaved?.({
          type: 'profile',
          message: t('อัปเดตโปรไฟล์ เรซูเม่ และสกิลแท็กเรียบร้อยแล้ว', 'Profile, resume, and skill tags updated'),
        });
      } else {
        const res = await profileApi.createJob({
          company_name: companyName.trim(),
          title: jobTitle.trim(),
          min_salary: Number(minSalary),
          max_salary: Number(maxSalary),
          experience_years_requirement: Number(expReq),
          work_style: workStyle,
          location: location.trim(),
          description: jobDescription.trim(),
          contact_email: user?.email,
          tags: cleanedTags,
        });
        onSaved?.({
          type: 'job',
          job: res?.data,
          message: t('สร้างประกาศงานใหม่เรียบร้อยแล้ว', 'New job posting created'),
        });
      }
      onBack();
    } catch (err) {
      setError(err?.response?.data?.message || t('ไม่สามารถบันทึกข้อมูลได้', 'Failed to save changes'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingAccount(true);
    try {
      const res = await settingsApi.updateNotifications(notificationPrefs);
      onNotify?.(
        t('บันทึกสำเร็จ', 'Saved'),
        res?.message || t('บันทึกการตั้งค่าการแจ้งเตือนแล้ว', 'Notification preferences saved'),
        'success'
      );
    } catch (err) {
      onNotify?.(
        t('เกิดข้อผิดพลาด', 'Error'),
        err?.response?.data?.message || t('ไม่สามารถบันทึกการแจ้งเตือนได้', 'Failed to save notifications'),
        'error'
      );
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleChangePassword = async (payload) => {
    try {
      const res = await settingsApi.changePassword(payload);
      onNotify?.(
        t('สำเร็จ', 'Success'),
        res?.message || t('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'Password updated'),
        'success'
      );
      return true;
    } catch (err) {
      onNotify?.(
        t('เปลี่ยนรหัสผ่านไม่สำเร็จ', 'Password Error'),
        err?.response?.data?.message || t('รหัสผ่านปัจจุบันไม่ถูกต้อง', 'Current password is incorrect'),
        'error'
      );
      return false;
    }
  };

  const handlePersistAppearance = async (payload) => {
    try {
      await settingsApi.updateAppearance(payload);
      onNotify?.(
        t('อัปเดตการแสดงผล', 'Appearance Updated'),
        t('บันทึกการตั้งค่าภาษาและธีมแล้ว', 'Language & theme preferences saved'),
        'success'
      );
    } catch {
      // LocalStorage still preserves appearance even if offline
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      onNavigateSection(sections[currentStepIndex - 1].key);
    } else {
      onBack();
    }
  };

  const goNext = () => {
    if (currentStepIndex < sections.length - 1) {
      onNavigateSection(sections[currentStepIndex + 1].key);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] text-[#111111] dark:text-neutral-100 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-14 bg-white dark:bg-[#141416] border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-500 text-xs font-medium text-[#111111] dark:text-neutral-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('กลับหน้าหลัก', 'Back to Dashboard')}</span>
            </button>
            <span className="hidden sm:inline-block h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
            <div className="hidden sm:block">
              <BrandMark size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && personaOptions.length > 0 && (
              <select
                value={activePersonaId}
                onChange={(e) => setActivePersonaId(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-[#141416] text-[#111111] dark:text-neutral-100 focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
              >
                {personaOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.title}
                  </option>
                ))}
              </select>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] flex items-center justify-center shrink-0 mt-0.5">
            <Settings className="w-5 h-5 text-[#111111] dark:text-white" />
          </div>
          <div>
            <p className="font-mono-num text-[11px] uppercase tracking-widest text-neutral-400">
              Settings & Account
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#111111] dark:text-white mt-0.5">
              {t('ตั้งค่าและบัญชีผู้ใช้', 'Settings & Account')}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t(
                'จัดการโปรไฟล์ เรซูเม่ การแจ้งเตือน ความปลอดภัย และการแสดงผลของระบบ',
                'Manage your profile, resume, notifications, security, and display preferences'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 space-y-4">
            <nav
              aria-label={t('หมวดหมู่การตั้งค่า', 'Settings Categories')}
              className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 flex lg:flex-col gap-1.5 overflow-x-auto"
            >
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = section.key === resolvedSection;
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => onNavigateSection(section.key)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all cursor-pointer shrink-0 lg:shrink lg:w-full ${
                      isActive
                        ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                        isActive
                          ? 'border-white/20 dark:border-neutral-300 bg-white/10 dark:bg-neutral-100'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono-num text-[10px] ${
                            isActive
                              ? 'text-neutral-300 dark:text-neutral-500'
                              : 'text-neutral-400'
                          }`}
                        >
                          {section.step}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold truncate">
                          {section.title}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] truncate hidden lg:block ${
                          isActive
                            ? 'text-neutral-300 dark:text-neutral-600'
                            : 'text-neutral-400 dark:text-neutral-500'
                        }`}
                      >
                        {section.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Quick Summary Card */}
            <div className="hidden lg:block bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-2.5">
              <p className="font-mono-num text-[10px] uppercase tracking-widest text-neutral-400">
                Summary Preview
              </p>
              {isCandidateMode ? (
                <div className="space-y-1.5 text-xs">
                  <p className="font-semibold text-[#111111] dark:text-white truncate">
                    {fullName || t('ยังไม่ได้ระบุชื่อ', 'Name not set')}
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 truncate">
                    {title || t('ยังไม่ได้ระบุตำแหน่ง', 'Title not set')}
                  </p>
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{t('รูปแบบงาน', 'Work Style')}: {workStyle}</span>
                    <span className="font-mono-num">{tags.length} {t('สกิล', 'skills')}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <p className="font-semibold text-[#111111] dark:text-white truncate">
                    {jobTitle || t('ยังไม่ได้ระบุชื่อตำแหน่ง', 'Job title not set')}
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 truncate">
                    {companyName || t('ยังไม่ได้ระบุบริษัท', 'Company not set')}
                  </p>
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{t('รูปแบบงาน', 'Work Style')}: {workStyle}</span>
                    <span className="font-mono-num">{tags.length} {t('สกิล', 'skills')}</span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Active Subpage Content */}
          <main className="lg:col-span-8">
            <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden">
              {isLoading ? (
                <div className="p-16 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-7 h-7 text-[#111111] dark:text-white animate-spin" />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t('กำลังโหลดข้อมูลการตั้งค่า...', 'Loading settings...')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="p-5 sm:p-7 space-y-5 animate-editorial-in" key={resolvedSection}>
                    {error && (
                      <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                        {error}
                      </div>
                    )}

                    {isCandidateMode && resolvedSection === 'profile' && (
                      <CandidateBasicSection
                        fullName={fullName}
                        setFullName={setFullName}
                        title={title}
                        setTitle={setTitle}
                        email={email}
                        setEmail={setEmail}
                        location={location}
                        setLocation={setLocation}
                        bio={bio}
                        setBio={setBio}
                        portfolioUrl={portfolioUrl}
                        setPortfolioUrl={setPortfolioUrl}
                        githubUrl={githubUrl}
                        setGithubUrl={setGithubUrl}
                        linkedinUrl={linkedinUrl}
                        setLinkedinUrl={setLinkedinUrl}
                        resumeFilename={resumeFilename}
                        setResumeFilename={setResumeFilename}
                        setResumeData={setResumeData}
                        onlineResume={onlineResume}
                        setOnlineResume={setOnlineResume}
                      />
                    )}
                    {isCandidateMode && resolvedSection === 'preferences' && (
                      <CandidateWorkSection
                        experienceYears={experienceYears}
                        setExperienceYears={setExperienceYears}
                        expectedSalary={expectedSalary}
                        setExpectedSalary={setExpectedSalary}
                        workStyle={workStyle}
                        setWorkStyle={setWorkStyle}
                      />
                    )}
                    {isCandidateMode && resolvedSection === 'skills' && (
                      <SkillTagsSection
                        isCandidateMode
                        tags={tags}
                        unusedTags={unusedTags}
                        selectedTagIdToAdd={selectedTagIdToAdd}
                        setSelectedTagIdToAdd={setSelectedTagIdToAdd}
                        onAddTag={handleAddTag}
                        onWeightChange={handleTagWeightChange}
                        onRemoveTag={handleRemoveTag}
                      />
                    )}

                    {!isCandidateMode && resolvedSection === 'job-info' && (
                      <RecruiterJobInfoSection
                        companyName={companyName}
                        setCompanyName={setCompanyName}
                        jobTitle={jobTitle}
                        setJobTitle={setJobTitle}
                        jobDescription={jobDescription}
                        setJobDescription={setJobDescription}
                      />
                    )}
                    {!isCandidateMode && resolvedSection === 'job-requirements' && (
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
                    )}
                    {!isCandidateMode && resolvedSection === 'job-skills' && (
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
                    )}

                    {resolvedSection === 'notifications' && (
                      <NotificationSettingsSection
                        preferences={notificationPrefs}
                        onChange={setNotificationPrefs}
                        onSave={handleSaveNotifications}
                        isSaving={isSavingAccount}
                      />
                    )}

                    {resolvedSection === 'security' && (
                      <SecuritySettingsSection onChangePassword={handleChangePassword} />
                    )}

                    {resolvedSection === 'appearance' && (
                      <AppearanceSettingsSection
                        onPersistAppearance={handlePersistAppearance}
                      />
                    )}
                  </div>

                  {/* Footer Navigation & Save (for Profile / Job sections) */}
                  {!isAccountSection && (
                    <div className="px-5 sm:px-7 py-4 bg-neutral-50/80 dark:bg-neutral-900/60 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={goPrev}
                        className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{currentStepIndex === 0 ? t('ยกเลิก', 'Cancel') : t('หน้าก่อนหน้า', 'Previous')}</span>
                      </button>

                      <div className="flex items-center gap-2.5">
                        {currentStepIndex < 2 && (
                          <button
                            type="button"
                            onClick={goNext}
                            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-400 text-xs font-semibold text-[#111111] dark:text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <span>{t('ถัดไป', 'Next')}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2 rounded-lg bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-[#111111] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-colors"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{t('กำลังบันทึก...', 'Saving...')}</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>
                                {isCandidateMode
                                  ? t('บันทึกโปรไฟล์', 'Save Profile')
                                  : t('โพสต์ประกาศงาน', 'Publish Job')}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
