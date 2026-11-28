import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Terminal,
  User,
} from 'lucide-react';
import BrandMark from '../components/ui/BrandMark';
import ThemeToggle from '../components/ui/ThemeToggle';
import QuickAccountSwitcher from '../components/QuickAccountSwitcher';
import { useAuth } from '../context/AuthContext';

const SAMPLE_WEIGHTS = [
  { tag: 'TypeScript / React', weight: '0.90', matched: true },
  { tag: 'Node.js & PostgreSQL', weight: '0.85', matched: true },
  { tag: 'System Architecture', weight: '0.70', matched: true },
  { tag: 'Kubernetes / Docker', weight: '0.60', matched: false },
];

export default function AuthPage() {
  const { login, register, isSubmitting, authError, clearError } = useAuth();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] text-[#111111] dark:text-neutral-100 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-xs text-neutral-500 dark:text-neutral-400">
              แพลตฟอร์มจับคู่งานสาย Tech ด้วยค่าน้ำหนักทักษะจริง
            </span>
            <button
              type="button"
              onClick={() => setShowDemoPanel((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-[#141416] hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              โหมดทดสอบ (Demo)
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Swiss Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Editorial Column (7 cols) */}
        <section className="lg:col-span-7 space-y-8 pt-2">
          <div className="space-y-4">
            <p className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400 font-medium">
              Tag-Weighted Matching Engine
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.15] text-[#111111] dark:text-white">
              คัดกรองงานและผู้สมัครด้วยค่าน้ำหนักทักษะ ไม่ใช่การเดาจากคีย์เวิร์ด
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
              MatchWork คำนวณความเข้ากันได้จากน้ำหนักความสำคัญของแต่ละทักษะ (0.00–1.00)
              รูปแบบการทำงาน และช่วงเงินเดือน เพื่อให้ทั้งผู้สมัครและทีม HR เห็นเหตุผลของคะแนนก่อนกดเชื่อมต่อและเริ่มแชททันที
            </p>
          </div>

          {/* Swiss Spec Table */}
          <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  ตัวอย่างการคำนวณ Compatibility Score
                </span>
              </div>
              <span className="font-mono-num text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                80% MATCH
              </span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {SAMPLE_WEIGHTS.map((row) => (
                <div
                  key={row.tag}
                  className="px-4 py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        row.matched ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    />
                    <span
                      className={
                        row.matched
                          ? 'text-[#111111] dark:text-neutral-100 font-medium'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }
                    >
                      {row.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono-num text-neutral-500 dark:text-neutral-400">
                      w = {row.weight}
                    </span>
                    <span
                      className={`font-mono-num text-[11px] px-2 py-0.5 rounded border ${
                        row.matched
                          ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {row.matched ? 'ตรงกัน' : 'ยังไม่ตรง'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30 grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-neutral-400 text-[11px]">1. ปัดการ์ด</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                  สนใจ / ข้าม / บันทึก
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-[11px]">2. Mutual Match</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                  ใจตรงกันทั้งสองฝั่ง
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-[11px]">3. Real-time Chat</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                  นัดสัมภาษณ์ผ่าน Socket
                </p>
              </div>
            </div>
          </div>

          {showDemoPanel && (
            <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 animate-editorial-in">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-[#111111] dark:text-neutral-100">
                    เข้าสู่ระบบด้วยบัญชีทดสอบ
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    เลือกบทบาทที่ต้องการเพื่อทดลองระบบทันทีโดยไม่ต้องกรอกรหัสผ่าน
                  </p>
                </div>
              </div>
              <QuickAccountSwitcher />
            </div>
          )}
        </section>

        {/* Right Auth Card (5 cols) */}
        <section className="lg:col-span-5">
          <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 sm:p-7">
            <div className="grid grid-cols-2 border border-neutral-200 dark:border-neutral-800 rounded-md p-1 bg-neutral-50 dark:bg-neutral-900 mb-6">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`py-2 text-xs font-medium rounded transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-[#141416] text-[#111111] dark:text-white border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('register')}
                className={`py-2 text-xs font-medium rounded transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-[#141416] text-[#111111] dark:text-white border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            {authError && (
              <div className="mb-4 px-3 py-2.5 border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40 rounded-md flex items-start gap-2 text-xs text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0B0B0C] border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 pr-9 text-sm bg-white dark:bg-[#0B0B0C] border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#111111] dark:hover:text-white cursor-pointer"
                      aria-label="แสดงหรือซ่อนรหัสผ่าน"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-60 text-white dark:text-[#111111] text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>เข้าสู่ระบบ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>อยากลองระบบทันที?</span>
                  <button
                    type="button"
                    onClick={() => setShowDemoPanel(true)}
                    className="text-[#111111] dark:text-neutral-100 font-medium underline underline-offset-4 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    เปิดบัญชีทดสอบ
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('candidate')}
                    className={`p-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                      regRole === 'candidate'
                        ? 'border-[#111111] dark:border-neutral-300 bg-neutral-50 dark:bg-neutral-900'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#111111] dark:text-neutral-100">
                      <User className="w-3.5 h-3.5" />
                      ผู้หางาน (Candidate)
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('recruiter')}
                    className={`p-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                      regRole === 'recruiter'
                        ? 'border-[#111111] dark:border-neutral-300 bg-neutral-50 dark:bg-neutral-900'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#111111] dark:text-neutral-100">
                      <Building2 className="w-3.5 h-3.5" />
                      บริษัท (Recruiter)
                    </div>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {regRole === 'recruiter' ? 'ชื่อบริษัท / องค์กร' : 'ชื่อ-นามสกุล'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={regRole === 'recruiter' ? 'เช่น Beam Data Labs' : 'เช่น กวินทร์ สุขสวัสดิ์'}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0B0B0C] border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {regRole === 'recruiter' ? 'ตำแหน่งงานที่เปิดรับ' : 'ตำแหน่งงานที่มองหา'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    placeholder="เช่น Senior Full-Stack Engineer"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0B0B0C] border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      รูปแบบการทำงาน
                    </label>
                    <select
                      value={regWorkStyle}
                      onChange={(e) => setRegWorkStyle(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-[#0B0B0C] focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
                    >
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                      <option value="onsite">Onsite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      เงินเดือน (บาท)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={regSalary}
                      onChange={(e) => setRegSalary(e.target.value)}
                      placeholder="65000"
                      className="w-full px-3 py-2 text-sm font-mono-num bg-white dark:bg-[#0B0B0C] border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0B0B0C] border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    รหัสผ่าน
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0B0B0C] border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-60 text-white dark:text-[#111111] text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>สร้างบัญชีและเริ่มจับคู่</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <span>MatchWork — Tag-Weighted Tech Talent Matching</span>
          <span className="font-mono-num">JWT + Socket.IO Real-time</span>
        </div>
      </footer>
    </div>
  );
}
