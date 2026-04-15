'use client';

import { useState } from 'react';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Користувачі' },
    { id: 'settings', label: 'Налаштування' },
    { id: 'logs', label: 'Логи' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Адміністративна панель</h2>

      {/* Вкладки */}
      <div className="border-b border-border">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Содержимое вкладок */}
      <div className="py-2">
        {activeTab === 'users' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <UserManagement />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground">Налаштування системи</p>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground">Системні логи</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
