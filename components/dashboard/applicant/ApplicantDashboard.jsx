'use client';

import { useState } from 'react';
import OrderList from '../shared/OrderList';
import OrderCreationForm from '../shared/OrderCreationForm';

/**
 * ApplicantDashboard - Дашборд для заявителей
 * Используется для создания и управления заявками
 * 
 * Функционал:
 * - Просмотр списка своих заявок
 * - Создание новых заявок
 * - Переключение между вкладками (список / создание)
 * - Отображение статусов заявок
 * - Удаление отклоненных заявок и пунктов
 * 
 * Вкладки:
 * - list: Список заявок (OrderList)
 * - create: Создание новой заявки (OrderCreationForm)
 */
const ApplicantDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { id: 'orders', label: 'Мої замовлення' },
    { id: 'new', label: 'Нове замовлення' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Подання заявок</h2>

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
        {activeTab === 'orders' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <OrderList allowEdit={true} />
          </div>
        )}

        {activeTab === 'new' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <OrderCreationForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;
