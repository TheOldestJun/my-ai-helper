'use client';

import { useState } from 'react';
import MenuPlanner from './MenuPlanner';
import MilkTracker from './MilkTracker';
import KitchenCalculations from './KitchenCalculations';

/**
 * KitchenDashboard - Дашборд для кухни/харчоблоку
 * Используется для планирования меню и учета продуктов
 * 
 * Функционал:
 * - Планирование меню на неделю (MenuPlanner)
 * - Учет молока (MilkTracker)
 * - Расчеты продуктов (KitchenCalculations)
 * - Переключение между вкладками
 * 
 * Вкладки:
 * - menu: Меню на неделю
 * - milk: Учет молока
 * - calculations: Расчеты продуктов
 */
const KitchenDashboard = () => {
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Кухня / Харчоблок</h2>

      {/* Вкладки */}
      <div className="border-b border-border">
        <nav className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'menu'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Меню на тиждень
          </button>
          <button
            onClick={() => setActiveTab('milk')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'milk'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Молоко
          </button>
          <button
            onClick={() => setActiveTab('calculations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calculations'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Розрахунки
          </button>
        </nav>
      </div>

      {/* Содержимое вкладок */}
      <div className="py-2">
        {activeTab === 'menu' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <MenuPlanner />
          </div>
        )}

        {activeTab === 'milk' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <MilkTracker />
          </div>
        )}

        {activeTab === 'calculations' && (
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
            <KitchenCalculations />
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;
