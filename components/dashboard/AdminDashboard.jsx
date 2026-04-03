'use client';

import { useState } from 'react';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Загальне' },
    { id: 'users', label: 'Користувачі' },
    { id: 'settings', label: 'Налаштування' },
    { id: 'logs', label: 'Логи' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Адміністративна панель</h2>

      {/* Вкладки */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Содержимое вкладок */}
      <div className="py-2">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Користувачі</h3>
              <p className="text-sm text-slate-600">Управління користувачами та ролями</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Налаштування</h3>
              <p className="text-sm text-slate-600">Системні налаштування</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Логи</h3>
              <p className="text-sm text-slate-600">Перегляд системних логів</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <UserManagement />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-600">Налаштування системи</p>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-600">Системні логи</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
