import { useState } from 'react';
import { CheckCircle2, KeyRound, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SecuritySettingsSection({ onChangePassword }) {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordSubmit = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t('กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วน', 'Please fill in all password fields'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'New password must be at least 6 characters'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน', 'New passwords do not match'));
      return;
    }

    setIsUpdatingPassword(true);
    const ok = await onChangePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setIsUpdatingPassword(false);

    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-neutral-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Security · Password</span>
        </div>
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white mt-1">
          {t('ตั้งค่าความปลอดภัย', 'Security Settings')}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t(
            'จัดการและเปลี่ยนรหัสผ่านสำหรับบัญชีของคุณ',
            'Manage and update your account password'
          )}
        </p>
      </div>

      {/* Change Password */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#111111] dark:text-neutral-200" />
          <h3 className="text-sm font-semibold text-[#111111] dark:text-white">
            {t('เปลี่ยนรหัสผ่าน', 'Change Password')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
              {t('รหัสผ่านปัจจุบัน', 'Current Password')}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
              {t('รหัสผ่านใหม่', 'New Password')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
              {t('ยืนยันรหัสผ่านใหม่', 'Confirm Password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
            />
          </div>
        </div>

        {passwordError && (
          <p className="text-xs text-rose-600 dark:text-rose-400">{passwordError}</p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handlePasswordSubmit}
            disabled={isUpdatingPassword}
            className="px-3.5 py-2 rounded-lg bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isUpdatingPassword ? t('กำลังอัปเดต...', 'Updating...') : t('อัปเดตรหัสผ่าน', 'Update Password')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
