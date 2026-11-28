import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] hover:border-[#111111] dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
      title={isDark ? 'สลับเป็น Light Mode' : 'สลับเป็น Dark Mode'}
      aria-label={isDark ? 'สลับเป็น Light Mode' : 'สลับเป็น Dark Mode'}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
