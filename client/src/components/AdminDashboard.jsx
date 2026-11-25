import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Heart,
  Loader2,
  PieChart as PieChartIcon,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Users,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { adminApi, authApi } from '../services/api';

const TAG_BAR_COLORS = ['#2563EB', '#4F46E5', '#6366F1', '#3B82F6', '#0EA5E9'];

export default function AdminDashboard({ isOpen, onClose, onDataChanged }) {
  const { role } = useAuth();
  const isAdmin = (role || '').toLowerCase() === 'admin';

  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'tags' | 'users' | 'logs'
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [tags, setTags] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  // Add Tag form
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState('technical_skill');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError('');
    try {
      const [statsRes, jobsRes, tagsRes, logsRes, personasRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getJobs(),
        adminApi.getTags(),
        adminApi.getLogs(),
        authApi.getPersonas(),
      ]);
      setStats(statsRes?.data || null);
      setJobs(jobsRes?.data || []);
      setTags(tagsRes?.data || []);
      setLogs(logsRes?.data || []);
      setCandidates(personasRes?.data?.candidates || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'ไม่สามารถโหลดข้อมูล Admin Console ได้');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadAdminData();
    }
  }, [isOpen, isAdmin, loadAdminData]);

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await adminApi.updateJobStatus(jobId, nextStatus);
      await loadAdminData();
      onDataChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะงานได้');
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsAddingTag(true);
    setError('');
    try {
      await adminApi.createTag({
        tag_name: newTagName.trim(),
        category: newTagCategory,
      });
      setNewTagName('');
      await loadAdminData();
      onDataChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'ไม่สามารถเพิ่มแท็กได้');
    } finally {
      setIsAddingTag(false);
    }
  };

  const topTagsData = useMemo(() => stats?.topDemandedTags || [], [stats]);

  const interactionPieData = useMemo(() => {
    const b = stats?.interactionBreakdown;
    if (!b) return [];
    return [
      { name: 'Mutual Match', value: b.mutualMatchCount || 0, color: '#10B981' },
      { name: 'Like (Interest)', value: b.likeCount || 0, color: '#2563EB' },
      { name: 'Pass (Skip)', value: b.passCount || 0, color: '#F43F5E' },
      { name: 'Save', value: b.saveCount || 0, color: '#F59E0B' },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const matchRate = stats?.interactionBreakdown?.matchRate ?? 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl animate-pop-in overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Admin Management Console
              </h3>
              <p className="text-[11px] text-slate-500">
                ภาพรวมระบบ จัดการผู้ใช้งาน ตำแหน่งงาน และคลังสกิลแท็ก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={loadAdminData}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Access Guard */}
        {!isAdmin ? (
          <div className="p-10 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
            <h4 className="font-bold text-slate-900">ไม่มีสิทธิ์เข้าถึง (Admin Only)</h4>
            <p className="text-xs text-slate-500">
              หน้านี้สงวนไว้สำหรับบัญชีที่มีสิทธิ์ Admin เท่านั้น
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Overview Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                <div className="flex items-center justify-between text-blue-600 mb-1">
                  <span className="text-xs font-bold">Total Users</span>
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {stats?.totalUsers ?? '-'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Candidates: {stats?.totalCandidates ?? '-'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
                <div className="flex items-center justify-between text-indigo-600 mb-1">
                  <span className="text-xs font-bold">Total Jobs</span>
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {stats?.totalJobs ?? '-'}
                </div>
                <div className="text-[11px] text-slate-500">ประกาศงานในระบบ</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="flex items-center justify-between text-emerald-600 mb-1">
                  <span className="text-xs font-bold">Connections</span>
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {stats?.totalMatches ?? '-'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Interactions: {stats?.totalInteractions ?? '-'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center justify-between text-amber-600 mb-1">
                  <span className="text-xs font-bold">System Tags</span>
                  <Tag className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {stats?.totalTags ?? '-'}
                </div>
                <div className="text-[11px] text-slate-500">คลังแท็กมาตรฐาน</div>
              </div>
            </div>

            {/* Product Analytics Charts (2-Column Responsive Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart 1: Top 5 Demanded Skills/Tags */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>Top 5 Demanded Skills / Tags</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      ทักษะที่ถูกระบุในประกาศงานมากที่สุด
                    </p>
                  </div>
                </div>

                {topTagsData.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">
                    ยังไม่มีข้อมูลแท็กในประกาศงาน
                  </div>
                ) : (
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topTagsData}
                        margin={{ top: 10, right: 8, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis
                          dataKey="tag_name"
                          interval={0}
                          tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          width={28}
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: '#64748B' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }}
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            fontSize: '12px',
                            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                          }}
                          formatter={(value, _name, props) => [
                            `${value} งาน (Avg Weight: ${props?.payload?.avg_weight ?? '-'})`,
                            'จำนวนประกาศงาน',
                          ]}
                        />
                        <Bar dataKey="job_count" radius={[8, 8, 0, 0]} maxBarSize={32}>
                          {topTagsData.map((entry, idx) => (
                            <Cell
                              key={entry.tag_id || entry.tag_name}
                              fill={TAG_BAR_COLORS[idx % TAG_BAR_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Chart 2: Interaction Breakdown (Match Rate vs Pass) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <PieChartIcon className="w-4 h-4 text-indigo-600" />
                      <span>Interaction Breakdown & Match Rate</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      สัดส่วน Like, Pass และ Mutual Match
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Match Rate: {matchRate}%
                  </span>
                </div>

                {interactionPieData.length === 0 ? (
                  <div className="h-[220px] flex flex-col items-center justify-center text-xs text-slate-400">
                    <span>ยังไม่มีสถิติการปัดการ์ดในระบบ</span>
                    <span className="text-[11px] mt-1">ลองปัดการ์ดหรือกด Simulate Match เพื่อดูกราฟ</span>
                  </div>
                ) : (
                  <div className="h-[220px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={interactionPieData}
                          cx="50%"
                          cy="46%"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {interactionPieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            fontSize: '12px',
                            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                          }}
                          formatter={(value, name) => [`${value} ครั้ง`, name]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={32}
                          iconType="circle"
                          wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {[
                { id: 'jobs', label: `Jobs (${jobs.length})`, icon: Briefcase },
                { id: 'users', label: `Candidates (${candidates.length})`, icon: Users },
                { id: 'tags', label: `Tags (${tags.length})`, icon: Tag },
                { id: 'logs', label: `Logs (${logs.length})`, icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {isLoading && !stats ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
              </div>
            ) : activeTab === 'jobs' ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold">ตำแหน่งงาน</th>
                      <th className="p-3 font-bold">บริษัท</th>
                      <th className="p-3 font-bold">เงินเดือน</th>
                      <th className="p-3 font-bold">สถานะ</th>
                      <th className="p-3 font-bold text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map((job) => {
                      const isSuspended = job.status === 'suspended';
                      return (
                        <tr key={job.job_id} className="hover:bg-slate-50/60">
                          <td className="p-3 font-bold text-slate-900">{job.title}</td>
                          <td className="p-3 text-slate-600">{job.company_name}</td>
                          <td className="p-3 text-slate-600 whitespace-nowrap">
                            ฿{(job.min_salary || 0).toLocaleString()} - ฿
                            {(job.max_salary || 0).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSuspended
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isSuspended ? 'suspended' : 'active'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleJobStatus(job.job_id, job.status)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                                isSuspended
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              }`}
                            >
                              {isSuspended ? 'Activate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'users' ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold">ชื่อผู้สมัคร</th>
                      <th className="p-3 font-bold">ตำแหน่ง</th>
                      <th className="p-3 font-bold">รูปแบบงาน</th>
                      <th className="p-3 font-bold">เงินเดือนที่คาดหวัง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {candidates.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-bold text-slate-900">{c.full_name || c.name}</td>
                        <td className="p-3 text-slate-600">{c.title}</td>
                        <td className="p-3 capitalize text-slate-600">{c.work_style}</td>
                        <td className="p-3 text-slate-600">
                          ฿{(c.expected_salary || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'tags' ? (
              <div className="space-y-4">
                <form onSubmit={handleAddTag} className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    required
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="ชื่อแท็กใหม่ เช่น Next.js, Kubernetes"
                    className="flex-1 min-w-[180px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newTagCategory}
                    onChange={(e) => setNewTagCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="technical_skill">Technical Skill</option>
                    <option value="soft_skill">Soft Skill</option>
                    <option value="domain">Domain</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isAddingTag}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มแท็ก</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t.tag_id}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>{t.tag_name}</span>
                      <span className="text-[10px] text-slate-400">({t.category})</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold">Candidate</th>
                      <th className="p-3 font-bold">Job</th>
                      <th className="p-3 font-bold">Initiator</th>
                      <th className="p-3 font-bold">Action</th>
                      <th className="p-3 font-bold">Matched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          ยังไม่มีประวัติ Interaction
                        </td>
                      </tr>
                    ) : (
                      logs.slice(0, 30).map((log, i) => (
                        <tr key={log.interaction_id || i} className="hover:bg-slate-50/60">
                          <td className="p-3 font-semibold text-slate-800">{log.candidate_id}</td>
                          <td className="p-3 text-slate-600">{log.job_id}</td>
                          <td className="p-3 capitalize text-slate-600">{log.initiator_role}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3">
                            {log.is_matched ? (
                              <span className="text-emerald-600 font-bold">Yes</span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
