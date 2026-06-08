/**
 * Dashboard page - Главная страница дашборда
 * Отображает соответствующий дашборд в зависимости от роли пользователя
 * 
 * Роли и дашборды:
 * - ADMIN: AdminDashboard (административный дашборд)
 * - APPLICANT: ApplicantDashboard (создание и управление заявками)
 * - DIRECTORATE: DirectorateDashboard (одобрение/отклонение заявок)
 * - SUPPLY: SupplyDashboard (заказ товаров)
 * - WAREHOUSE: WarehouseDashboard (управление складом)
 * - KITCHEN: KitchenDashboard (планирование меню)
 * 
 * Если пользователь не авторизован, перенаправляет на страницу входа
 */
'use client';

import { useState, useEffect } from 'react';
import {
  AdminDashboard,
  SupplyDashboard,
  ApplicantDashboard,
  KitchenDashboard,
  WarehouseDashboard,
  DirectorateDashboard,
} from '@/components/dashboard';
import { getStoredUser, getToken, logout as clearAuth } from '@/lib/client-auth';

const roleDashboards = {
  ADMIN: AdminDashboard,
  DIRECTORATE: DirectorateDashboard,
  SUPPLY: SupplyDashboard,
  APPLICANT: ApplicantDashboard,
  KITCHEN: KitchenDashboard,
  WAREHOUSE: WarehouseDashboard,
};

const roleLabels = {
  ADMIN: 'Адміністратор',
  DIRECTORATE: 'Директорат',
  SUPPLY: 'Закупівлі',
  APPLICANT: 'Заявник',
  KITCHEN: 'Кухня',
  WAREHOUSE: 'Склад',
};

const roleColors = {
  ADMIN: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  DIRECTORATE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  SUPPLY: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  APPLICANT: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  KITCHEN: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  WAREHOUSE: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Verify token is still valid
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Token invalid');
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        if (data.user.roles && data.user.roles.length > 0) {
          setActiveRole(data.user.roles[0].name);
        }
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Доступ заборонено</h2>
          <p className="text-muted-foreground mb-4">Будь ласка, увійдіть в систему</p>
          <a href="/" className="inline-block px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
            На сторінку входу
          </a>
        </div>
      </div>
    );
  }

  const ActiveDashboard = activeRole ? roleDashboards[activeRole] : null;

  return (
    <div className="py-6">
        <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Вітаємо, {user.firstName} {user.lastName}</h1>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium">Вийти</button>
          </div>
        </div>

        {user.roles && user.roles.length > 1 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <button key={role.name} onClick={() => setActiveRole(role.name)} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border ${activeRole === role.name ? roleColors[role.name] : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}>
                  {roleLabels[role.name] || role.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {user.roles && user.roles.length === 1 && (
          <div className="mb-6">
            <span className={`inline-block px-4 py-2 rounded-lg font-medium text-sm border ${roleColors[activeRole]}`}>
              {roleLabels[activeRole] || activeRole}
            </span>
          </div>
        )}

        {ActiveDashboard && <ActiveDashboard />}
      </div>
    );
}
