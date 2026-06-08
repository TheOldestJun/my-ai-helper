'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import Autocomplete from '@/components/Autocomplete';
import { useProducts, useUnits } from '../../../hooks/useProductsUnitsQuery';
import { useCreateProduct } from '../../../hooks/useProductUnitMutations';
import { useCreateOrder } from '../../../hooks/useOrderMutations';
import { getStoredUser } from '@/lib/client-auth';

/**
 * OrderCreationForm - Форма для создания новой заявки
 * Используется в ApplicantDashboard для создания заявок
 * 
 * Функционал:
 * - Выбор приоритета заявки (LOW, NORMAL, HIGH, URGENT)
 * - Добавление нескольких товаров в заявку
 * - Выбор товаров из списка или создание новых на лету
 * - Выбор единиц измерения
 * - Указание количества и примечаний
 * - Добавление примечаний к заявке
 * 
 * Хуки TanStack Query:
 * - useProducts: загрузка списка товаров
 * - useUnits: загрузка списка единиц измерения
 * - useCreateProduct: создание нового товара
 * - useCreateOrder: создание новой заявки
 */

const priorityOptions = [
  { value: 'LOW', label: 'Низький' },
  { value: 'NORMAL', label: 'Нормальний' },
  { value: 'HIGH', label: 'Високий' },
  { value: 'URGENT', label: 'Терміновий' },
];

const OrderCreationForm = () => {
  const queryClient = useQueryClient();
  const { data: productsData } = useProducts();
  const { data: unitsData } = useUnits();
  const createProduct = useCreateProduct();
  const createOrder = useCreateOrder();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    priority: 'NORMAL',
    notes: '',
    items: [{ productId: '', unitId: '', quantity: '', notes: '' }],
  });

  const products = productsData?.products || [];
  const units = unitsData?.units || [];

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
      items: prev.items.map((item, i) => {
        if (i === index) {
          const newItem = { ...item, [field]: value };
          
          // Если выбран товар, автоматически выбираем его первую единицу измерения
          if (field === 'productId' && value) {
            const selectedProduct = products.find(p => p.id === value);
            if (selectedProduct && selectedProduct.units && selectedProduct.units.length > 0) {
              // Автоматически выбираем первую единицу товара
              newItem.unitId = selectedProduct.units[0].id;
            }
          }
          
          return newItem;
        }
        return item;
      }),
    }));
  };

  const handleCreateProduct = async (index, productName) => {
    try {
      const data = await createProduct.mutateAsync(productName);
      handleItemChange(index, 'productId', data.product.id);
      return data.product.id;
    } catch (err) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = getStoredUser();

    if (!user) {
      toast.error('Користувач не авторизований. Увійдіть в систему.');
      setLoading(false);
      return;
    }

    // Валідація
    const validItems = formData.items.filter(
      (item) => item.productId && item.unitId && item.quantity > 0
    );
    if (validItems.length === 0) {
      toast.error('Додайте хоча б один товар з кількістю');
      setLoading(false);
      return;
    }

    try {
      await createOrder.mutateAsync({
        priority: formData.priority,
        notes: formData.notes,
        products: validItems.map((item) => ({
          productId: item.productId,
          unitId: item.unitId,
          quantity: parseFloat(item.quantity),
          notes: item.notes,
        })),
      });
      setFormData({
        priority: 'NORMAL',
        notes: '',
        items: [{ productId: '', unitId: '', quantity: '', notes: '' }],
      });
    } catch (err) {
      // Error handling is done in the mutation
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold text-foreground mb-4">Нове замовлення</h3>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Створення...' : 'Створити замовлення'}
        </button>
      </form>
    </div>
  );
};

export default OrderCreationForm;