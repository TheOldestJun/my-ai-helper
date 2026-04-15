'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import Autocomplete from '@/components/Autocomplete';

const OrderItemEditForm = ({ item, orderId, onSave, onCancel }) => {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    unitId: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        productId: item.product.id,
        unitId: item.unit.id,
        quantity: item.quantity.toString(),
        notes: item.notes || '',
      });
    }
  }, [item]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, unitsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/units'),
        ]);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.products || []);
        }
        if (unitsRes.ok) {
          const unitsData = await unitsRes.json();
          setUnits(unitsData.units || []);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    fetchData();
  }, []);

  const handleCreateProduct = async (productName) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('Товар з такою назвою вже існує');
        } else {
          toast.error(data.error || 'Помилка при створенні товару');
        }
        return;
      }

      setProducts((prev) => [...prev, data.product]);
      setFormData({ ...formData, productId: data.product.id });
      toast.success(`Товар "${data.product.name}" успішно створено`);
    } catch (err) {
      console.error('Помилка створення товару:', err);
      toast.error('Помилка з\'єднання при створенні товару');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.productId || !formData.unitId || !formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error('Заповніть всі поля');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/products/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseFloat(formData.quantity),
          unitId: formData.unitId,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка при оновленні пункту заявки');
      }

      toast.success('Пункт заявки успішно оновлено');
      onSave();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold text-foreground mb-4">Редагування пункту заявки</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Товар</label>
          <Autocomplete
            options={products}
            value={formData.productId}
            onChange={(value) => setFormData({ ...formData, productId: value })}
            onCreate={(name) => handleCreateProduct(name)}
            creatable={true}
            createLabel={(search) => `Створити товар "${search}"`}
            placeholder="Пошук товару..."
            labelKey="name"
            valueKey="id"
            searchKeys={['name']}
            displayFormat={(p) => p.name}
            emptyMessage="Нічого не знайдено. Введіть назву для створення."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Кількість</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Одиниця</label>
            <Autocomplete
              options={units}
              value={formData.unitId}
              onChange={(value) => setFormData({ ...formData, unitId: value })}
              creatable={true}
              createLabel={(search) => `Створити одиницю "${search}"`}
              placeholder="Одиниця..."
              labelKey="symbol"
              valueKey="id"
              searchKeys={['symbol', 'name']}
              displayFormat={(u) => `${u.name} (${u.symbol})`}
              emptyMessage="Нічого не знайдено"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Примітки</label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            placeholder="Примітки до пункту..."
          />
        </div>

        {item.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Причина відмови:</p>
            <p className="text-sm text-red-600 dark:text-red-400">{item.rejectionReason}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 px-4 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderItemEditForm;
