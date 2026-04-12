'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-lg bg-white/10">
        <div className="w-8 h-8 rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-white/10">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded transition-colors ${
          theme === 'light'
            ? 'bg-white text-cyan-600'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        aria-label="Світла тема"
        title="Світла тема"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded transition-colors ${
          theme === 'dark'
            ? 'bg-white text-cyan-600'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        aria-label="Темна тема"
        title="Темна тема"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded transition-colors ${
          theme === 'system'
            ? 'bg-white text-cyan-600'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        aria-label="Системна тема"
        title="Системна тема"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
