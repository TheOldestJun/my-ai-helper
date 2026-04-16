'use client';

import { useState } from 'react';
import WarehouseOrderList from '../shared/WarehouseOrderList';

const WarehouseDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Складський облік</h2>

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
            Заявки
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'incoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Приход товару
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'outgoing'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Видаток товару
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stock'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Залишки
          </button>
        </nav>
      </div>

      {/* Содержимое вкладок */}
      <div className="py-2">
        {activeTab === 'orders' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <WarehouseOrderList />
          </div>
        )}

        {activeTab === 'incoming' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground">Оформлення приходу</p>
          </div>
        )}

        {activeTab === 'outgoing' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground">Оформлення видатку</p>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground">Перегляд залишків на складі</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseDashboard;
