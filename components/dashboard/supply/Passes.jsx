'use client';

import { useState } from 'react';
import { Truck, FileText, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import Autocomplete from '@/components/Autocomplete';
import { useProducts, useUnits } from '../../../hooks/useApi';
import { useCreateProduct, useCreateUnit } from '../../../hooks/useMutations';

const passTypes = [
  { id: 'import', label: 'Ввіз' },
  { id: 'export', label: 'Вивіз' },
  { id: 'import_with_export', label: 'Ввіз з наступним вивозом' },
];

const MAX_ITEMS = 31;

const Passes = () => {
  const queryClient = useQueryClient();
  const { data: productsData } = useProducts();
  const { data: unitsData } = useUnits();
  const createProduct = useCreateProduct();
  const createUnit = useCreateUnit();

  const products = productsData?.products || [];
  const units = unitsData?.units || [];

  const [selectedType, setSelectedType] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [items, setItems] = useState([{ productId: '', unitId: '', quantity: '' }]);

  const handleTypeChange = (typeId) => {
    if (selectedType === typeId) {
      setSelectedType(null);
      setItems([{ productId: '', unitId: '', quantity: '' }]);
      return;
    }
    setSelectedType(typeId);
    setItems([{ productId: '', unitId: '', quantity: '' }]);
  };

  const isItemFilled = (item) => item.productId && item.unitId && item.quantity > 0;

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = prev.map((item, i) => {
        if (i === index) {
          const newItem = { ...item, [field]: value };
          if (field === 'productId' && value) {
            const selectedProduct = products.find(p => p.id === value);
            if (selectedProduct && selectedProduct.units && selectedProduct.units.length > 0) {
              newItem.unitId = selectedProduct.units[0].id;
            }
          }
          return newItem;
        }
        return item;
      });

      const currentFilled = isItemFilled(updated[index]);
      const isLastAndFilled = index === updated.length - 1 && currentFilled;

      if (isLastAndFilled && updated.length < MAX_ITEMS) {
        updated.push({ productId: '', unitId: '', quantity: '' });
      }

      return updated;
    });
  };

  const handleCreateProductItem = async (index, productName) => {
    try {
      const data = await createProduct.mutateAsync(productName);
      handleItemChange(index, 'productId', data.product.id);
      return data.product.id;
    } catch (err) {
      return null;
    }
  };

  const handleCreateUnitItem = async (index, search) => {
    const parts = search.split('(');
    const name = parts[0].trim();
    const symbol = parts[1] ? parts[1].replace(')', '').trim() : name.slice(0, 3);
    try {
      const data = await createUnit.mutateAsync({ name, symbol });
      handleItemChange(index, 'unitId', data.unit.id);
      return data.unit.id;
    } catch (err) {
      return null;
    }
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const filledItems = items.filter(isItemFilled);
    if (filledItems.length === 0) {
      toast.error('Додайте хоча б один товар');
      return;
    }
    toast.success('Перепустку збережено');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Перепустки</h3>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">Дата початку дії</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        <p className="text-sm text-muted-foreground mb-4">Оберіть тип перепустки:</p>

        <div className="space-y-2">
          {passTypes.map((type) => (
            <div key={type.id} className="border border-border rounded-lg overflow-hidden">
              <label
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                  selectedType === type.id
                    ? 'bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="passType"
                  value={type.id}
                  checked={selectedType === type.id}
                  onChange={() => handleTypeChange(type.id)}
                  className="accent-primary"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{type.label}</span>
                </div>
                {selectedType === type.id && (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </label>

              {selectedType === type.id && (
                <div className="border-t border-border p-4 space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        {index === 0 && (
                          <label className="block text-xs text-muted-foreground mb-1">Товар</label>
                        )}
                        <Autocomplete
                          options={products}
                          value={item.productId}
                          onChange={(value) => handleItemChange(index, 'productId', value)}
                          onCreate={(name) => handleCreateProductItem(index, name)}
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
                        {index === 0 && (
                          <label className="block text-xs text-muted-foreground mb-1">Кількість</label>
                        )}
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
                      <div className="flex gap-2">
                        <div className="flex-1">
                          {index === 0 && (
                            <label className="block text-xs text-muted-foreground mb-1">Одиниця</label>
                          )}
                          <Autocomplete
                            options={units}
                            value={item.unitId}
                            onChange={(value) => handleItemChange(index, 'unitId', value)}
                            onCreate={(search) => handleCreateUnitItem(index, search)}
                            creatable={true}
                            createLabel={(search) => `Створити "${search}"`}
                            placeholder="Одиниця..."
                            labelKey="symbol"
                            valueKey="id"
                            searchKeys={['symbol', 'name']}
                            displayFormat={(u) => `${u.name} (${u.symbol})`}
                            emptyMessage="Нічого не знайдено"
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="px-3 py-2 text-destructive hover:text-destructive/80 text-sm self-end"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="text-xs text-muted-foreground">
                    {items.length} / {MAX_ITEMS}
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  >
                    Зберегти перепустку
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Passes;
