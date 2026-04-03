'use client';

import { useState } from 'react';
import UserCreationForm from './UserCreationForm';
import UserList from './UserList';

const UserManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('create');

  const subTabs = [
    { id: 'create', label: 'Створити' },
    { id: 'list', label: 'Список / Редагувати / Видалити' },
  ];

  return (
    <div className="space-y-4">
      {/* Под-вкладки */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeSubTab === tab.id
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Содержимое под-вкладок */}
      <div className="py-2">
        {activeSubTab === 'create' && <UserCreationForm />}
        {activeSubTab === 'list' && <UserList />}
      </div>
    </div>
  );
};

export default UserManagement;
