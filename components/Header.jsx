'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Header - Компонент шапки сайта
 * Отображает логотип, навигацию и информацию о пользователе
 * 
 * Функционал:
 * - Отображение логотипа
 * - Навигация между дашбордами в зависимости от роли пользователя
 * - Мобильное меню (гамбургер)
 * - Выход из системы
 * - Отображение информации о текущем пользователе
 */
import { ThemeToggle } from './ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    setHasUser(!!localStorage.getItem('user'));
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { href: '/help', label: 'Допомога' },
  ];

  return (
    <header className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={hasUser ? '/dashboard' : '/'} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded" />
              <span className="text-white font-semibold text-lg hidden sm:block">My AI Helper</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/90 hover:text-white font-medium text-sm transition-colors duration-200 hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Theme Toggle & Burger Button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'none' }}
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="py-3 border-t border-white/20">
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 font-medium text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
