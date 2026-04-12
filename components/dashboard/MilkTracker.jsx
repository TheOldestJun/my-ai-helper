'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const MilkTracker = () => {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    consumed: '',
    remaining: '',
    notes: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('milkRecords');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse milk records');
      }
    }
  }, []);

  // Save to localStorage when records change
  useEffect(() => {
    localStorage.setItem('milkRecords', JSON.stringify(records));
  }, [records]);

  const handleAddRecord = (e) => {
    e.preventDefault();
    
    if (!newRecord.date) {
      toast.error('Вкажіть дату');
      return;
    }

    const record = {
      id: Date.now().toString(),
      ...newRecord,
      consumed: parseFloat(newRecord.consumed) || 0,
      remaining: parseFloat(newRecord.remaining) || 0,
    };

    setRecords((prev) => [record, ...prev]);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      consumed: '',
      remaining: '',
      notes: '',
    });
    toast.success('Запис додано');
  };

  const handleDelete = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.success('Запис видалено');
  };

  const totalConsumed = records.reduce((sum, r) => sum + r.consumed, 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Облік молока</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Расход - молоко по чеку (л)</p>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">{totalConsumed.toFixed(1)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Остаток на складі (л)</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-300">{records[records.length - 1]?.remaining.toFixed(1) || '0.0'}</p>
        </div>
      </div>

      {/* Add form */}
      <form onSubmit={handleAddRecord} className="bg-muted p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-foreground">Новий запис</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Дата</label>
            <input
              type="date"
              value={newRecord.date}
              onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Расход - молоко по чеку (л)</label>
            <input
              type="number"
              step="0.1"
              value={newRecord.consumed}
              onChange={(e) => setNewRecord({ ...newRecord, consumed: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Остаток на складі (л)</label>
            <input
              type="number"
              step="0.1"
              value={newRecord.remaining}
              onChange={(e) => setNewRecord({ ...newRecord, remaining: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              placeholder="0.0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Примітки</label>
          <input
            type="text"
            value={newRecord.notes}
            onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            placeholder="Додаткова інформація..."
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Додати запис
        </button>
      </form>

      {/* Records table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">Дата</th>
              <th className="px-3 py-2 text-right">Расход по чеку</th>
              <th className="px-3 py-2 text-right">Остаток на складі</th>
              <th className="px-3 py-2 text-left">Примітки</th>
              <th className="px-3 py-2 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-3 py-4 text-center text-muted-foreground">
                  Немає записів
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-muted/50">
                  <td className="px-3 py-2">{record.date}</td>
                  <td className="px-3 py-2 text-right">{record.consumed.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right">{record.remaining.toFixed(1)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{record.notes}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-destructive hover:text-destructive/80 text-xs"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MilkTracker;
