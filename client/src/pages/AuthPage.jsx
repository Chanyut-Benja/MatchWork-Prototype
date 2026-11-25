import { useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Heart,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Sparkles,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import QuickAccountSwitcher from '../components/QuickAccountSwitcher';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register, isSubmitting, authError, clearError } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('kawin.dev@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form state
  const [regRole, setRegRole] = useState('candidate');
  const [regName, setRegName] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regWorkStyle, setRegWorkStyle] = useState('hybrid');
  const [regSalary, setRegSalary] = useState('');

  const handleTabSwitch = (nextMode) => {
    clearError();
    setMode(nextMode);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await login({ email: loginEmail, password: loginPassword });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    await register({
      role: regRole,
      name: regName.trim(),
      title: regTitle.trim(),
      email: regEmail.trim(),
      password: regPassword,
      work_style: regWorkStyle,
      expected_salary: Number(regSalary) || 0,
      company_name: regRole === 'recruiter' ? regName.trim() : null,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] flex flex-col justify-between px-4 sm:px-8 py-6">
      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[30rem] h-[30rem] rounded-full bg-blue-500/[0.08] blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-rose-500/[0.07] blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[28rem] h-[28rem] rounded-full bg-indigo-500/[0.07] blur-3xl" />
      </div>

      {/* Top Brand Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] via-[#4F46E5] to-[#EC4899] flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              MATCH<span className="text-[#2563EB]">WORK</span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
              Smart Tech Job Matching
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Tag-Weighted Compatibility Engine</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-8">
        {/* Left Column: Tinder-inspired Hero & Preview Card */}
        <section className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#2563EB] text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tinder-Inspired Career Matching</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
            It starts with a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#EC4899]">
              match.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
            งานที่ใช่ เริ่มต้นที่การปัด — จับคู่ผู้สมัครสาย Tech กับบริษัทชั้นนำด้วยระบบคำนวณค่าน้ำหนักสกิลที่แม่นยำ
          </p>

          {/* Decorative Tinder-style Match Card Preview */}
          <div className="hidden md:block max-w-md mx-auto lg:mx-0 pt-2">
            <div className="animate-float-slow bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xl shadow-slate-900/10 text-left relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-md">
                    TI
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Senior Full-Stack Engineer</h3>
                    <p className="text-xs text-slate-500">Tech Innovator Co., Ltd.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  94% Match
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3.5 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-medium">
                  <MapPin className="w-3 h-3 text-blue-600" /> Bangkok • Hybrid
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-medium">
                  ฿75,000 - ฿110,000
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {['React (0.95)', 'Node.js (0.90)', 'TypeScript (0.85)', 'PostgreSQL (0.80)'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-semibold"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>

              {/* Mini Swipe Action Bar */}
              <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </div>
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#EC4899] text-white flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Auth Card + Quick Account Switcher */}
        <section className="lg:col-span-6 w-full max-w-lg mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xl shadow-slate-900/10">
            {/* Segmented Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 mb-6">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#2563EB] shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                เข้าสู่ระบบ (Log in)
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('register')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-[#2563EB] shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                สมัครสมาชิก (Register)
              </button>
            </div>

            {/* Error Alert */}
            {authError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-pop-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    อีเมลผู้ใช้งาน (Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="kawin.dev@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    รหัสผ่าน (Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    เดโม: รหัสผ่านเริ่มต้นคือ <code className="text-slate-600 font-semibold">password123</code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังเข้าสู่ระบบ...</span>
                    </>
                  ) : (
                    <span>เข้าสู่ระบบ (Log in)</span>
                  )}
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    เลือกประเภทบัญชี (Account Role)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRegRole('candidate')}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        regRole === 'candidate'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/15'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <User className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Candidate</div>
                        <div className="text-[10px] opacity-80">ผู้หางาน</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('recruiter')}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        regRole === 'recruiter'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/15'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Building2 className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Company</div>
                        <div className="text-[10px] opacity-80">ผู้ว่าจ้าง / HR</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {regRole === 'recruiter' ? 'ชื่อบริษัท / HR' : 'ชื่อ-นามสกุล'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={regRole === 'recruiter' ? 'เช่น Acme Tech' : 'เช่น สมชาย ใจดี'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ตำแหน่งงาน (Title)
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regTitle}
                        onChange={(e) => setRegTitle(e.target.value)}
                        placeholder="เช่น Full-Stack Dev"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      รูปแบบการทำงาน
                    </label>
                    <select
                      value={regWorkStyle}
                      onChange={(e) => setRegWorkStyle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                    >
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                      <option value="on-site">On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {regRole === 'recruiter' ? 'งบประมาณเงินเดือน (บาท)' : 'เงินเดือนที่คาดหวัง (บาท)'}
                    </label>
                    <input
                      type="number"
                      value={regSalary}
                      onChange={(e) => setRegSalary(e.target.value)}
                      placeholder="เช่น 65000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/15 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังสร้างบัญชี...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>สมัครสมาชิกและเข้าใช้งานทันที</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Account Switcher at bottom of card */}
            <div className="mt-5">
              <QuickAccountSwitcher variant="auth" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center pt-4">
        <p className="text-xs text-slate-400">
          MatchWork • React + Vite + Tailwind CSS • Powered by JWT & Tag-Weighted Matching
        </p>
      </footer>
    </div>
  );
}
