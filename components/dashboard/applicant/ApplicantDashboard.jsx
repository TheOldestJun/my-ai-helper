'use client';

import { useState } from 'react';
import OrderList from '../orders/OrderList';
import OrderCreationForm from '../orders/OrderCreationForm';
import ArchiveOrders from '../orders/ArchiveOrders';

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

  // Получение ID текущего пользователя
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;

  const tabs = [
    { id: 'orders', label: 'Мої замовлення' },
    { id: 'new', label: 'Нове замовлення' },
    { id: 'archive', label: 'Архів' },
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

        {activeTab === 'archive' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <ArchiveOrders userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;
