import { ArrowRight, Building2, ShieldCheck, UserCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  {
    role: 'candidate',
    label: 'Candidate',
    name: 'กวินทร์ สุขสวัสดิ์',
    subtitle: 'Senior Full-Stack Engineer • ปัดหางานตามสกิล',
    icon: UserCheck,
    accentClass:
      'bg-blue-50/80 hover:bg-blue-100/80 border-blue-200/90 hover:border-blue-400 text-blue-600',
    iconBgClass: 'bg-blue-600/10 text-blue-600 border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    role: 'recruiter',
    label: 'Company',
    name: 'Tech Innovator HR',
    subtitle: 'Company / Recruiter • ปัดหาผู้สมัครที่ใช่',
    icon: Building2,
    accentClass:
      'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-200/90 hover:border-indigo-400 text-indigo-600',
    iconBgClass: 'bg-indigo-600/10 text-indigo-600 border-indigo-200',
    badgeClass: 'bg-indigo-100 text-indigo-700',
  },
  {
    role: 'admin',
    label: 'Admin',
    name: 'System Admin',
    subtitle: 'ผู้ดูแลระบบ • ดูภาพรวมและสลับมุมมองได้',
    icon: ShieldCheck,
    accentClass:
      'bg-rose-50/80 hover:bg-rose-100/80 border-rose-200/90 hover:border-rose-400 text-rose-600',
    iconBgClass: 'bg-rose-600/10 text-rose-600 border-rose-200',
    badgeClass: 'bg-rose-100 text-rose-700',
  },
];

export default function QuickAccountSwitcher({ variant = 'auth', onSwitched }) {
  const { role: currentRole, isAuthenticated, isSubmitting, quickLogin, switchAccount } = useAuth();

  const handleSelect = async (targetRole) => {
    if (isSubmitting) return;
    const result = isAuthenticated
      ? await switchAccount({ role: targetRole })
      : await quickLogin(targetRole);

    if (result?.success && onSwitched) {
      onSwitched(result);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-xl shadow-slate-900/10 w-72">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Quick Account Switcher</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Demo</span>
        </div>
        <div className="space-y-1.5">
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            const isActive = isAuthenticated && currentRole === acc.role;
            return (
              <button
                key={acc.role}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSelect(acc.role)}
                className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer disabled:opacity-60 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${acc.iconBgClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{acc.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{acc.label}</div>
                  </div>
                </div>
                {isActive ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shrink-0">
                    Active
                  </span>
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200" />
        <span className="flex-shrink mx-3 inline-flex items-center gap-1.5 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          Quick Account Switcher (สำหรับทดสอบ)
        </span>
        <div className="flex-grow border-t border-slate-200" />
      </div>

      <div className="grid grid-cols-1 gap-2">
        {DEMO_ACCOUNTS.map((acc) => {
          const Icon = acc.icon;
          return (
            <button
              key={acc.role}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelect(acc.role)}
              className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-60 active:scale-[0.99] ${acc.accentClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${acc.iconBgClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {acc.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${acc.badgeClass}`}>
                      {acc.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{acc.subtitle}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
