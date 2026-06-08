'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getToken } from '@/lib/client-auth';

export default function LayoutSplash() {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const root = document.getElementById('layout-root');
    if (!root) return;

    const isHome = window.location.pathname === '/';
    const token = getToken();
    const splashShown = sessionStorage.getItem('splashShown');

    if (!isHome) {
      root.style.display = '';
      setPhase('done');
      return;
    }

    if (token) {
      window.location.href = '/dashboard';
      return;
    }

    if (splashShown) {
      root.style.display = '';
      setPhase('done');
      return;
    }

    const t1 = setTimeout(() => setPhase('exit'), 2800);
    const t2 = setTimeout(() => {
      root.style.display = '';
      setPhase('done');
      sessionStorage.setItem('splashShown', 'true');
    }, 3500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      style={{ animation: 'splashBgIn 0.8s ease-out forwards' }}
    >
      <style>{`
        @keyframes splashBgIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes splashCircleIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes splashCirclePulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes splashLogoIn {
          from { opacity: 0; transform: scale(0.3); }
          70% { opacity: 1; transform: scale(1.06); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes splashLogoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes splashExit {
          from { opacity: 1; transform: scale(1); filter: blur(0); }
          to { opacity: 0; transform: scale(1.12); filter: blur(6px); }
        }
        @keyframes splashExitBg {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full blur-3xl bg-cyan-200/40 dark:bg-cyan-500/10"
          style={{
            opacity: 0,
            animation: phase === 'exit'
              ? 'none'
              : 'splashCircleIn 1s ease-out 0s forwards, splashCirclePulse 2.5s ease-in-out 1.2s infinite',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full blur-3xl bg-blue-200/40 dark:bg-blue-500/10"
          style={{
            opacity: 0,
            animation: phase === 'exit'
              ? 'none'
              : 'splashCircleIn 1s ease-out 0.2s forwards, splashCirclePulse 2.5s ease-in-out 1.4s infinite',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] rounded-full blur-3xl bg-indigo-200/20 dark:bg-indigo-500/5"
          style={{
            opacity: 0,
            animation: phase === 'exit'
              ? 'none'
              : 'splashCircleIn 1s ease-out 0.4s forwards, splashCirclePulse 2.5s ease-in-out 1s infinite',
          }}
        />
      </div>

      <div
        className="relative"
        style={{
          animation: phase === 'exit'
            ? 'splashExit 0.7s ease-in forwards'
            : 'splashLogoIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards, splashLogoPulse 1.5s ease-in-out 1.3s infinite',
        }}
      >
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44">
          <Image
            src="/logo.png"
            alt="Логотип"
            fill
            sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>
    </div>
  );
}
