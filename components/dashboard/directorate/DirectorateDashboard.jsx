/**
 * DirectorateDashboard - Дашборд для директора
 * Используется для одобрения/отклонения заявок
 * 
 * Функционал:
 * - Отображение всех заявок для проверки
 * - Одобрение/отклонение отдельных пунктов заявки
 * - Отображение информации о заявителе
 * - Отображение примечаний к заявке и пунктам
 */
'use client';

import { useState } from 'react';
import DirectorateOrderList from './DirectorateOrderList';
import DirectorateOrderSummaryTable from './DirectorateOrderSummaryTable';
import ArchiveOrders from '../orders/ArchiveOrders';
import { getStoredUser } from '@/lib/client-auth';

const DirectorateDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { id: 'orders', label: 'Заявки на погодження' },
    { id: 'summary', label: 'Огляд заявок' },
    { id: 'archive', label: 'Архів' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Панель директорату</h2>

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
        {activeTab === 'summary' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <DirectorateOrderSummaryTable />
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <DirectorateOrderList />
          </div>
        )}
        {activeTab === 'archive' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <ArchiveOrders />
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorateDashboard;
