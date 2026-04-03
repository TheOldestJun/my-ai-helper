'use client';

import { useState } from 'react';
import OrderList from './OrderList';
import OrderCreationForm from './OrderCreationForm';

const ApplicantDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { id: 'orders', label: 'Мої замовлення' },
    { id: 'new', label: 'Нове замовлення' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Подання заявок</h2>

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
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <OrderList />
          </div>
        )}

        {activeTab === 'new' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <OrderCreationForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;
