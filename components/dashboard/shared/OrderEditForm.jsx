'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import Autocomplete from '@/components/Autocomplete';

const priorityOptions = [
  { value: 'LOW', label: 'Низький' },
  { value: 'NORMAL', label: 'Нормальний' },
  { value: 'HIGH', label: 'Високий' },
  { value: 'URGENT', label: 'Терміновий' },
];

const OrderEditForm = ({ order, onSave, onCancel }) => {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    priority: 'NORMAL',
    notes: '',
    items: [],
  });

  useEffect(() => {
    if (order) {
      setFormData({
        priority: order.priority,
        notes: order.notes || '',
        items: order.products.map((p) => ({
          productId: p.product.id,
          unitId: p.unit.id,
          quantity: p.quantity,
          notes: p.notes || '',
        })),
      });
    }
  }, [order]);

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

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', unitId: '', quantity: '', notes: '' }],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleCreateProduct = async (index, productName) => {
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
      handleItemChange(index, 'productId', data.product.id);
      toast.success(`Товар "${data.product.name}" успішно створено`);
    } catch (err) {
      console.error('Помилка створення товару:', err);
      toast.error('Помилка з\'єднання при створенні товару');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validItems = formData.items.filter(
      (item) => item.productId && item.unitId && item.quantity > 0
    );

    if (validItems.length === 0) {
      toast.error('Додайте хоча б один товар з кількістю');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority: formData.priority,
          notes: formData.notes,
          products: validItems.map((item) => ({
            productId: item.productId,
            unitId: item.unitId,
            quantity: parseFloat(item.quantity),
            notes: item.notes,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка при оновленні замовлення');
      }

      toast.success(`Замовлення №${data.order.number} успішно оновлено!`);
      onSave();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold text-foreground mb-4">Редагування замовлення #{order?.number}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Пріоритет</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Примітки</label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            placeholder="Додаткова інформація про замовлення..."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-foreground">Товари</label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              + Додати товар
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="p-3 bg-muted rounded-lg border border-border space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">Товар</label>
                  <Autocomplete
                    options={products}
                    value={item.productId}
                    onChange={(value) => handleItemChange(index, 'productId', value)}
                    onCreate={(name) => handleCreateProduct(index, name)}
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

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Кількість</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Одиниця</label>
                  <Autocomplete
                    options={units}
                    value={item.unitId}
                    onChange={(value) => handleItemChange(index, 'unitId', value)}
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

                <div className="sm:col-span-1 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-muted-foreground mb-1">Примітки</label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      placeholder="Примітки..."
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="px-3 py-2 text-destructive hover:text-destructive/80 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

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

export default OrderEditForm;
