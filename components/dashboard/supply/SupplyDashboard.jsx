'use client';

import { useState } from 'react';
import ExecutorOrderList from '../shared/ExecutorOrderList';

/**
 * SupplyDashboard - Дашборд для снабжения
 * Используется для заказа одобренных товаров
 * 
 * Функционал:
 * - Отображение списка одобренных товаров для заказа
 * - Изменение статуса товаров (ORDERED, PAID, IN_TRANSIT, COMPLETED)
 * - Группировка товаров по номеру заявки
 * - Отображение приоритетов и примечаний
 */
const SupplyDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Відділ закупівель</h2>

      {/* Вкладки */}
      <div className="border-b border-border">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Заявки на закупівлю
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'suppliers'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Постачальники
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'contracts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Договори
          </button>
        </nav>
      </div>

      {/* Содержимое вкладок */}
      <div className="py-2">
        {activeTab === 'orders' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <ExecutorOrderList />
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground">База постачальників</p>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground">Управління договорами</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplyDashboard;
