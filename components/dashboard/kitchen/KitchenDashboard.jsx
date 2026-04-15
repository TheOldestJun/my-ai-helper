'use client';

import { useState } from 'react';
import MenuPlanner from './MenuPlanner';
import MilkTracker from './MilkTracker';
import KitchenCalculations from './KitchenCalculations';

const KitchenDashboard = () => {
  const [activeTab, setActiveTab] = useState('menu');

  const tabs = [
    { id: 'menu', label: 'Меню на тиждень' },
    { id: 'milk', label: 'Молоко' },
    { id: 'calculations', label: 'Розрахунки' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Кухня / Харчоблок</h2>

      {/* Вкладки */}
      <div className="border-b border-border">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
