'use client';

import { useState } from 'react';
import { toast } from 'sonner';

const KitchenCalculations = () => {
  const [portions, setPortions] = useState(1);
  const [calculations, setCalculations] = useState([
    { id: 1, name: 'Каша вівсяна', unit: 'г', perPortion: 50, total: 50 },
    { id: 2, name: 'Молоко', unit: 'л', perPortion: 0.2, total: 0.2 },
    { id: 3, name: 'Цукор', unit: 'г', perPortion: 10, total: 10 },
    { id: 4, name: 'Сіль', unit: 'г', perPortion: 2, total: 2 },
  ]);

  const handlePortionsChange = (value) => {
    const newPortions = parseInt(value) || 1;
    setPortions(newPortions);
    setCalculations((prev) =>
      prev.map((item) => ({
        ...item,
        total: item.perPortion * newPortions,
      }))
    );
  };

  const handlePerPortionChange = (id, value) => {
    const newPerPortion = parseFloat(value) || 0;
    setCalculations((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, perPortion: newPerPortion, total: newPerPortion * portions }
          : item
      )
    );
  };

  const handleAddItem = () => {
    const newId = Math.max(...calculations.map((i) => i.id), 0) + 1;
    setCalculations((prev) => [
      ...prev,
      { id: newId, name: '', unit: 'г', perPortion: 0, total: 0 },
    ]);
  };

  const handleRemoveItem = (id) => {
    setCalculations((prev) => prev.filter((i) => i.id !== id));
  };

  const handleNameChange = (id, name) => {
    setCalculations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleUnitChange = (id, unit) => {
    setCalculations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unit } : item))
    );
  };

  const handleSave = () => {
    // TODO: Save to API or localStorage
    toast.success('Розрахунки збережено');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Розрахунки продуктів</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Друк
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Зберегти
          </button>
        </div>
      </div>

      {/* Portions input */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Кількість порцій
        </label>
        <input
          type="number"
          min="1"
          value={portions}
          onChange={(e) => handlePortionsChange(e.target.value)}
          className="w-32 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Calculations table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Продукт</th>
              <th className="px-3 py-2 text-left">Од. виміру</th>
              <th className="px-3 py-2 text-right">На порцію</th>
              <th className="px-3 py-2 text-right font-semibold">Загальна кількість</th>
              <th className="px-3 py-2 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {calculations.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleNameChange(item.id, e.target.value)}
                    placeholder="Назва продукту"
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.unit}
                    onChange={(e) => handleUnitChange(item.id, e.target.value)}
                    className="px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="г">Грам (г)</option>
                    <option value="кг">Кілограм (кг)</option>
                    <option value="л">Літр (л)</option>
                    <option value="мл">Мілілітр (мл)</option>
                    <option value="шт">Штука (шт)</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.1"
                    value={item.perPortion}
                    onChange={(e) => handlePerPortionChange(item.id, e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-slate-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </td>
                <td className="px-3 py-2 text-right font-semibold text-cyan-700">
                  {item.total.toFixed(2)} {item.unit}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAddItem}
        className="px-4 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
      >
        + Додати продукт
      </button>

      {/* Summary */}
      <div className="bg-cyan-50 p-4 rounded-lg">
        <p className="text-sm text-cyan-800">
          <strong>Підсумок:</strong> Розрахунок для {portions} порцій
        </p>
      </div>
    </div>
  );
};

export default KitchenCalculations;
