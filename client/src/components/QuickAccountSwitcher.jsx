import { ArrowRight, Building2, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  {
    role: 'candidate',
    label: 'Candidate',
    name: 'กวินทร์ สุขสวัสดิ์',
    subtitle: 'Senior Full-Stack Engineer',
    icon: UserCheck,
  },
  {
    role: 'recruiter',
    label: 'Company',
    name: 'TechScale Innovations',
    subtitle: 'Recruiter • เปิดรับ Full-Stack',
    icon: Building2,
  },
  {
    role: 'admin',
    label: 'Admin',
    name: 'System Admin',
    subtitle: 'ผู้ดูแลระบบ & สถิติรวม',
    icon: ShieldCheck,
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
      <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 shadow-sm w-64">
        <div className="flex items-center justify-between px-1.5 pb-2 mb-1.5 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-[11px] font-semibold text-[#111111] dark:text-neutral-100">
            สลับบัญชีทดสอบ
          </span>
          <span className="font-mono-num text-[10px] uppercase tracking-wider text-neutral-400">
            Demo
          </span>
        </div>
        <div className="space-y-1">
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            const isActive = isAuthenticated && currentRole === acc.role;
            return (
              <button
                key={acc.role}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSelect(acc.role)}
                className={`w-full px-2.5 py-2 rounded-md border text-left transition-colors flex items-center justify-between gap-2 cursor-pointer disabled:opacity-60 ${
                  isActive
                    ? 'border-[#111111] dark:border-neutral-400 bg-neutral-50 dark:bg-neutral-900'
                    : 'border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#111111] dark:text-neutral-100 truncate">
                      {acc.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {acc.label}
                    </div>
                  </div>
                </div>
                {isActive ? (
                  <span className="font-mono-num text-[10px] font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                    Active
                  </span>
                ) : (
                  <ArrowRight className="w-3 h-3 text-neutral-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {DEMO_ACCOUNTS.map((acc) => {
        const Icon = acc.icon;
        return (
          <button
            key={acc.role}
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSelect(acc.role)}
            className="p-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-900 hover:border-[#111111] dark:hover:border-neutral-500 text-left transition-colors cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Icon className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span className="font-mono-num text-[10px] uppercase text-neutral-400">
                {acc.label}
              </span>
            </div>
            <p className="text-xs font-medium text-[#111111] dark:text-neutral-100 truncate">
              {acc.name}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              {acc.subtitle}
            </p>
          </button>
        );
      })}
    </div>
  );
}
