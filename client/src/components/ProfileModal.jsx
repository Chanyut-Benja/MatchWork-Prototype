import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Loader2,
  Plus,
  Save,
  Sliders,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { profileApi } from '../services/api';

export default function ProfileModal({
  isOpen,
  onClose,
  effectiveRole,
  activePersonaId,
  user,
  onSaved,
}) {
  const isCandidateMode = effectiveRole === 'candidate';

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTagIdToAdd, setSelectedTagIdToAdd] = useState('');

  // Candidate Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [expectedSalary, setExpectedSalary] = useState(65000);
  const [workStyle, setWorkStyle] = useState('hybrid');
  const [location, setLocation] = useState('Bangkok, Thailand');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState([]); // [{ tag_id, tag_name, weight }]

  // Recruiter / Company Job Posting state
  const [companyName, setCompanyName] = useState(user?.company_name || user?.name || '');
  const [jobTitle, setJobTitle] = useState('');
  const [minSalary, setMinSalary] = useState(50000);
  const [maxSalary, setMaxSalary] = useState(90000);
  const [expReq, setExpReq] = useState(2);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setError('');
    setIsLoading(true);

    async function loadData() {
      try {
        const tagsRes = await profileApi.getAllTags();
        const availableTags = tagsRes?.data || [];
        if (active) setAllTags(availableTags);

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
          setTags(
            (profRes?.tags || []).map((t) => ({
              tag_id: t.tag_id,
              tag_name: t.tag_name || t.name,
              weight: Number(t.weight || 0.8),
            }))
          );
        } else {
          // Initialize recruiter job form with sensible starter tags
          setCompanyName(user?.company_name || user?.name || 'Tech Innovator Co., Ltd.');
          setJobTitle('');
          setMinSalary(55000);
          setMaxSalary(95000);
          setExpReq(2);
          setWorkStyle('hybrid');
          setLocation('Bangkok, Thailand');
          setJobDescription('');
          setTags(
            availableTags.slice(0, 3).map((t) => ({
              tag_id: t.tag_id,
              tag_name: t.tag_name,
              weight: 0.85,
            }))
          );
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [isOpen, isCandidateMode, activePersonaId, user]);

  const unusedTags = useMemo(() => {
    const usedIds = new Set(tags.map((t) => Number(t.tag_id)));
    return allTags.filter((t) => !usedIds.has(Number(t.tag_id)));
  }, [allTags, tags]);

  const handleAddTag = () => {
    const idNum = Number(selectedTagIdToAdd || unusedTags[0]?.tag_id);
    if (!idNum) return;
    const found = allTags.find((t) => Number(t.tag_id) === idNum);
    if (!found) return;
    setTags((prev) => [
      ...prev,
      { tag_id: found.tag_id, tag_name: found.tag_name, weight: 0.8 },
    ]);
    setSelectedTagIdToAdd('');
  };

  const handleTagWeightChange = (tagId, weight) => {
    setTags((prev) =>
      prev.map((t) => (t.tag_id === tagId ? { ...t, weight: Number(weight) } : t))
    );
  };

  const handleRemoveTag = (tagId) => {
    setTags((prev) => prev.filter((t) => t.tag_id !== tagId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const cleanedTags = tags.map((t) => ({
        tag_id: Number(t.tag_id),
        weight: Number(t.weight),
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
          tags: cleanedTags,
        });
        await profileApi.updateCandidateTags(activePersonaId, cleanedTags);
        onSaved?.({ type: 'profile', message: 'อัปเดตโปรไฟล์และสกิลแท็กเรียบร้อยแล้ว' });
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
          message: 'สร้างประกาศงานใหม่เรียบร้อยแล้ว',
        });
      }
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-pop-in overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              {isCandidateMode ? <User className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {isCandidateMode
                  ? 'แก้ไขโปรไฟล์ & ค่าน้ำหนักสกิล'
                  : 'สร้างประกาศรับสมัครงานใหม่ (Post Job)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isCandidateMode
                  ? 'ปรับแต่งข้อมูลส่วนตัวและน้ำหนักความถนัด (0.1 - 1.0)'
                  : 'ระบุรายละเอียดตำแหน่งงานและสกิลที่ต้องการเพื่อจับคู่ผู้สมัคร'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {isCandidateMode ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ตำแหน่งงาน (Title)
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ประสบการณ์ (ปี)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      เงินเดือนที่คาดหวัง (บาท)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      รูปแบบการทำงาน
                    </label>
                    <select
                      value={workStyle}
                      onChange={(e) => setWorkStyle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                      <option value="on-site">On-site</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    แนะนำตัวสั้นๆ (Bio)
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อบริษัท
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อตำแหน่งงานที่เปิดรับ
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น Senior React Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      เงินเดือนต่ำสุด
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      เงินเดือนสูงสุด
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ประสบการณ์ (ปี)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={expReq}
                      onChange={(e) => setExpReq(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      รูปแบบงาน
                    </label>
                    <select
                      value={workStyle}
                      onChange={(e) => setWorkStyle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                      <option value="on-site">On-site</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รายละเอียดงาน
                  </label>
                  <textarea
                    rows={2}
                    placeholder="อธิบายลักษณะงานและทีมของคุณ..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </>
            )}

            {/* Tag Weights Management */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>จัดการ Skill Tags & น้ำหนัก ({tags.length})</span>
                </span>
              </div>

              {/* Add Tag Row */}
              {unusedTags.length > 0 && (
                <div className="flex gap-2 mb-3">
                  <select
                    value={selectedTagIdToAdd || unusedTags[0]?.tag_id || ''}
                    onChange={(e) => setSelectedTagIdToAdd(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {unusedTags.map((t) => (
                      <option key={t.tag_id} value={t.tag_id}>
                        {t.tag_name} ({t.category})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มแท็ก</span>
                  </button>
                </div>
              )}

              {/* Tag Sliders */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {tags.map((t) => (
                  <div
                    key={t.tag_id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <span className="text-xs font-bold text-slate-800 w-28 sm:w-36 truncate">
                      {t.tag_name}
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={t.weight}
                      onChange={(e) => handleTagWeightChange(t.tag_id, e.target.value)}
                      className="flex-1 accent-blue-600"
                    />
                    <span className="text-xs font-extrabold text-blue-600 w-10 text-right">
                      {Number(t.weight).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t.tag_id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      aria-label="Remove tag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isCandidateMode ? 'บันทึกโปรไฟล์' : 'โพสต์ประกาศงาน'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
