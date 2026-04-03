'use client';

import { useState, useEffect } from 'react';
import {
  AdminDashboard,
  SupplyDashboard,
  ApplicantDashboard,
  KitchenDashboard,
  WarehouseDashboard,
} from '../../components/dashboard';

const roleDashboards = {
  ADMIN: AdminDashboard,
  SUPPLY: SupplyDashboard,
  APPLICANT: ApplicantDashboard,
  KITCHEN: KitchenDashboard,
  WAREHOUSE: WarehouseDashboard,
};

const roleLabels = {
  ADMIN: 'Адміністратор',
  SUPPLY: 'Закупівлі',
  APPLICANT: 'Заявник',
  KITCHEN: 'Кухня',
  WAREHOUSE: 'Склад',
};

const roleColors = {
  ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  SUPPLY: 'bg-blue-100 text-blue-700 border-blue-200',
  APPLICANT: 'bg-green-100 text-green-700 border-green-200',
  KITCHEN: 'bg-orange-100 text-orange-700 border-orange-200',
  WAREHOUSE: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.roles && parsedUser.roles.length > 0) {
        setActiveRole(parsedUser.roles[0].name);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
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
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Доступ заборонено</h2>
          <p className="text-slate-600 mb-4">Будь ласка, увійдіть в систему</p>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Вітаємо, {user.firstName} {user.lastName}</h1>
              <p className="text-slate-600 mt-1">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">Вийти</button>
          </div>
        </div>

        {user.roles && user.roles.length > 1 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <button key={role.name} onClick={() => setActiveRole(role.name)} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border ${activeRole === role.name ? roleColors[role.name] : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
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
