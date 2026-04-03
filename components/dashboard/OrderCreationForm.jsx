'use client';
import { useState, useEffect } from 'react';

import Autocomplete from '../Autocomplete';

const priorityOptions = [
  { value: 'LOW', label: 'Низький' },
  { value: 'NORMAL', label: 'Нормальний' },
  { value: 'HIGH', label: 'Високий' },
  { value: 'URGENT', label: 'Терміновий' },
];

const OrderCreationForm = () => {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    priority: 'NORMAL',
    notes: '',
    items: [{ productId: '', unitId: '', quantity: '', notes: '' }],
  });

  useEffect(() => {
    // Загружаем список товаров и единиц измерения
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
          setError('Товар з такою назвою вже існує');
        } else {
          setError(data.error || 'Помилка при створенні товару');
        }
        return;
      }

      // Добавляем новый товар в список и выбираем его
      setProducts((prev) => [...prev, data.product]);
      handleItemChange(index, 'productId', data.product.id);
      setMessage(`Товар "${data.product.name}" успішно створено`);
      
      // Очищаем сообщение через 3 секунды
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Помилка створення товару:', err);
      setError('Помилка з\'єднання при створенні товару');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Получаем пользователя из localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    if (!user || !user.id) {
      setError('Користувач не авторизований. Увійдіть в систему.');
      setLoading(false);
      return;
    }

    // Валидация
    const validItems = formData.items.filter(
      (item) => item.productId && item.unitId && item.quantity > 0
    );
    if (validItems.length === 0) {
      setError('Додайте хоча б один товар з кількістю');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority: formData.priority,
          notes: formData.notes,
          userId: user.id,
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
        throw new Error(data.error || 'Помилка при створенні замовлення');
      }

      setMessage(`Замовлення №${data.order.number} успішно створено!`);
      setFormData({
        priority: 'NORMAL',
        notes: '',
        items: [{ productId: '', unitId: '', quantity: '', notes: '' }],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Нове замовлення</h3>

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Пріоритет</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Примітки</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Додаткова інформація про замовлення..."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Товари</label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
            >
              + Додати товар
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Товар</label>
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
                  <label className="block text-xs text-slate-500 mb-1">Кількість</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Одиниця</label>
                  <Autocomplete
                    options={units}
                    value={item.unitId}
                    onChange={(value) => handleItemChange(index, 'unitId', value)}
                    placeholder="Пошук одиниці..."
                    labelKey="name"
                    valueKey="id"
                    searchKeys={['name', 'symbol']}
                    displayFormat={(u) => `${u.name} (${u.symbol})`}
                    emptyMessage="Не знайдено"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Примітки до товару..."
                />
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Видалити
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Створення...' : 'Створити замовлення'}
        </button>
      </form>
    </div>
  );
};

export default OrderCreationForm;