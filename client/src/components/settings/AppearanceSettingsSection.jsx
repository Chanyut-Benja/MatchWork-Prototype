import { Check, Globe, Monitor, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function AppearanceSettingsSection({ onPersistAppearance }) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleSelectTheme = (nextTheme) => {
    setTheme(nextTheme);
    onPersistAppearance?.({ language, theme_preference: nextTheme });
  };

  const handleSelectLanguage = (nextLang) => {
    setLanguage(nextLang);
    onPersistAppearance?.({ language: nextLang, theme_preference: theme });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-neutral-400">
          <Monitor className="w-3.5 h-3.5" />
          <span>Appearance · Language</span>
        </div>
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white mt-1">
          {t('ตั้งค่าการแสดงผลและภาษา', 'Appearance & Language')}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t(
            'ปรับโหมดสีหน้าจอ (Light / Dark) และภาษาที่ใช้งานในระบบ',
            'Customize your color theme (Light / Dark) and preferred display language'
          )}
        </p>
      </div>

      {/* Theme Mode */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {t('ธีมการแสดงผล (Theme)', 'Display Theme')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectTheme('light')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              theme === 'light'
                ? 'border-[#111111] dark:border-white bg-neutral-50 dark:bg-neutral-900'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111] dark:text-white">
                  Light Mode
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('สว่าง สบายตา เหมาะกับกลางวัน', 'Clean bright interface')}
                </p>
              </div>
            </div>
            {theme === 'light' && (
              <span className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              theme === 'dark'
                ? 'border-[#111111] dark:border-white bg-neutral-50 dark:bg-neutral-900'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-neutral-700 bg-[#0B0B0C] flex items-center justify-center text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111] dark:text-white">
                  Dark Mode
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('โทนมืด ลดแสงจ้า ถนอมสายตา', 'Low-light dark interface')}
                </p>
              </div>
            </div>
            {theme === 'dark' && (
              <span className="w-6 h-6 rounded-full bg-white text-[#111111] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Language Selection */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {t('ภาษา (Language)', 'Language')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectLanguage('th')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              language === 'th'
                ? 'border-[#111111] dark:border-white bg-neutral-50 dark:bg-neutral-900'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-xs font-bold text-[#111111] dark:text-white">
                TH
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111] dark:text-white">
                  ภาษาไทย (Thai)
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  แสดงเมนูและข้อความภาษาไทย
                </p>
              </div>
            </div>
            {language === 'th' && (
              <span className="w-6 h-6 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectLanguage('en')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              language === 'en'
                ? 'border-[#111111] dark:border-white bg-neutral-50 dark:bg-neutral-900'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#111111] dark:text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111] dark:text-white">
                  English (EN)
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Display interface in English
                </p>
              </div>
            </div>
            {language === 'en' && (
              <span className="w-6 h-6 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
