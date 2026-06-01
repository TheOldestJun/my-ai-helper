'use client';
import { useState, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import Autocomplete from '@/components/Autocomplete';
import DatePicker from '@/components/DatePicker';
import { useDishes } from '../../../hooks/useApi';
import { useCreateDish, useUpdateDish } from '../../../hooks/useMutations';

/**
 * MenuPlanner - Компонент для планирования меню на неделю
 * Используется в KitchenDashboard для создания меню на неделю
 * 
 * Функционал:
 * - Выбор страв для каждого дня недели и типа приема пищи
 * - Создание новых страв на лету
 * - Выбор рабочих дней недели
 * - Сохранение меню в localStorage
 * - Экспорт меню в PDF
 * 
 * Типы приемов пищи:
 * - soup: Первая страва
 * - garnish: Гарнир
 * - meat: Мясная страва
 * - salad: Салат
 * - bakery: Выпечка
 * - drink: Напій
 * 
 * Хуки TanStack Query:
 * - useDishes: загрузка списка страв
 * - useCreateDish: создание новой стравы
 */

const daysOfWeek = [
  { id: 'monday', label: 'Понеділок' },
  { id: 'tuesday', label: 'Вівторок' },
  { id: 'wednesday', label: 'Середа' },
  { id: 'thursday', label: 'Четвер' },
  { id: 'friday', label: "П'ятниця" },
];

const mealTypes = [
  { id: 'soup', label: 'Перша страва' },
  { id: 'garnish', label: 'Гарнір' },
  { id: 'meat', label: "М'ясна страва" },
  { id: 'salad', label: 'Салат' },
  { id: 'bakery', label: 'Випічка' },
  { id: 'drink', label: 'Напій' },
];

const MenuPlanner = () => {
  const queryClient = useQueryClient();
  const { data: dishesData, isLoading: loading } = useDishes();
  const createDish = useCreateDish();
  const updateDish = useUpdateDish();
  const createResolveRef = useRef(null);
  const [menu, setMenu] = useState(() => {
    try {
      const saved = localStorage.getItem('weeklyMenu');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [priceInputs, setPriceInputs] = useState({});
  const [createModal, setCreateModal] = useState({ open: false, name: '', mealTypeId: '', price: '' });
  const [selectedDays, setSelectedDays] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedDays');
      return saved ? JSON.parse(saved) : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    } catch {
      return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    }
  });
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday;
  });

  const dishes = dishesData?.dishes || [];

  // Отримуємо страви для конкретного типу прийому їжі
  const getDishesForMealType = (mealTypeId) => {
    const typeMapping = {
      'soup': 'SOUP',
      'garnish': 'GARNISH',
      'meat': 'MEAT',
      'salad': 'SALAD',
      'bakery': 'BAKERY',
      'drink': 'DRINK',
    };
    const dishType = typeMapping[mealTypeId];
    return dishes.filter(dish => dish.type === dishType);
  };

  // Дні тижня, що відображаються — починаючи з startDate за календарем
  const visibleDays = useMemo(() => {
    const dayIdFromIndex = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };
    const dayLabels = { monday: 'Понеділок', tuesday: 'Вівторок', wednesday: 'Середа', thursday: 'Четвер', friday: "П'ятниця" };
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dayId = dayIdFromIndex[d.getDay()];
      if (dayId && selectedDays.includes(dayId)) {
        result.push({
          id: dayId,
          label: dayLabels[dayId],
          dateStr: d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }),
        });
      }
    }
    return result;
  }, [startDate, selectedDays]);

  const toggleDay = (dayId) => {
    setSelectedDays((prev) => {
      const next = prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId];
      localStorage.setItem('selectedDays', JSON.stringify(next));
      return next;
    });
  };
  const handleAddDish = (day, mealType, dishId) => {
    if (!dishId) return;

    setMenu((prev) => {
      const dayMenu = prev[day] || {};

      const newMenu = {
        ...prev,
        [day]: {
          ...dayMenu,
          [mealType]: [dishId],
        },
      };
      
      localStorage.setItem('weeklyMenu', JSON.stringify(newMenu));
      return newMenu;
    });
  };

  const handleRemoveDish = (day, mealType, dishId) => {
    setMenu((prev) => {
      const newMenu = {
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: prev[day][mealType].filter((id) => id !== dishId),
        },
      };
      localStorage.setItem('weeklyMenu', JSON.stringify(newMenu));
      return newMenu;
    });
  };

  const handleCreateDish = (dishName, mealTypeId) => {
    setCreateModal({ open: true, name: dishName, mealTypeId, price: '' });
    return new Promise((resolve) => {
      createResolveRef.current = resolve;
    });
  };

  const handleCreateDishConfirm = () => {
    const { name, mealTypeId, price: priceStr } = createModal;
    const typeMapping = {
      'soup': 'SOUP',
      'garnish': 'GARNISH',
      'meat': 'MEAT',
      'salad': 'SALAD',
      'bakery': 'BAKERY',
      'drink': 'DRINK',
    };
    const dishType = typeMapping[mealTypeId];
    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      toast.error('Будь ласка, введіть коректну ціну');
      return;
    }
    setCreateModal((prev) => ({ ...prev, open: false }));
    createDish.mutateAsync({ name, type: dishType, price }).then((data) => {
      if (createResolveRef.current) {
        createResolveRef.current(data.dish.id);
        createResolveRef.current = null;
      }
    });
  };

  const handleCreateDishCancel = () => {
    setCreateModal((prev) => ({ ...prev, open: false }));
    if (createResolveRef.current) {
      createResolveRef.current(null);
      createResolveRef.current = null;
    }
  };

  const handleSave = () => {
    toast.success('Меню збережено');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Картинки для каждого дня недели (эмодзи кухни)
      const dayImages = {
        'monday': '🍲',
        'tuesday': '🥗',
        'wednesday': '🍝',
        'thursday': '🍛',
        'friday': '🍱',
      };
      
      // Создаем временный div для генерации PDF
      const element = document.createElement('div');
      element.style.padding = '30px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.color = '#000000';
      element.style.backgroundColor = '#FFFFFF';
      
      // Формируем HTML контент
      let htmlContent = '';
      
      // Добавляем таблицу для каждого дня
      visibleDays.forEach((day, dayIndex) => {
        // Добавляем разрыв страницы перед каждым днем (кроме первого)
        const pageBreakStyle = dayIndex > 0 ? 'page-break-before: always;' : '';
        const dayEmoji = dayImages[day.id] || '🍽️';
        const dayDate = day.dateStr;
        
        htmlContent += `
          <div style="margin-bottom: 30px; ${pageBreakStyle}">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <span style="font-size: 72px; margin-right: 20px;">${dayEmoji}</span>
              <div>
                <h2 style="color: #0891B2; font-size: 36px; margin: 0; text-transform: uppercase; font-weight: bold;">
                  ${day.label}
                </h2>
                <p style="color: #666; font-size: 20px; margin: 8px 0 0 0;">${dayDate}</p>
              </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(135deg, #0891B2 0%, #22D3EE 100%); color: #FFFFFF;">
                  <th style="padding: 16px; text-align: left; border: 1px solid #0891B2; font-weight: bold; font-size: 20px;">Категорія</th>
                  <th style="padding: 16px; text-align: left; border: 1px solid #0891B2; font-weight: bold; font-size: 20px;">Страви</th>
                  <th style="padding: 16px; text-align: center; border: 1px solid #0891B2; font-weight: bold; font-size: 20px; width: 120px;">Ціна</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        mealTypes.forEach((meal, index) => {
          const dishesList = menu[day.id]?.[meal.id] || [];
          const dishNames = dishesList.map(id => getDishName(id))[0] || '-';
          const totalPrice = dishesList.reduce((sum, id) => sum + getDishPrice(id), 0);
          const bgColor = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
          const borderColor = index % 2 === 0 ? '#E2E8F0' : '#CBD5E1';
          
          htmlContent += `
            <tr style="background-color: ${bgColor}; color: #000000;">
              <td style="padding: 16px; border: 1px solid ${borderColor}; font-weight: bold; color: #0891B2; font-size: 18px;">${meal.label}</td>
              <td style="padding: 16px; border: 1px solid ${borderColor}; font-size: 18px;">${dishNames}</td>
              <td style="padding: 16px; border: 1px solid ${borderColor}; font-size: 18px; text-align: center;">${totalPrice > 0 ? `${totalPrice.toFixed(2)}₴` : '-'}</td>
            </tr>
          `;
        });
        
        const dayTotal = mealTypes.reduce((sum, meal) => {
          const dishesList = menu[day.id]?.[meal.id] || [];
          return sum + dishesList.reduce((s, id) => s + getDishPrice(id), 0);
        }, 0);
        
        htmlContent += `
              </tbody>
              <tfoot>
                <tr style="background-color: #F0FDFA; font-weight: bold;">
                  <td style="padding: 16px; border: 1px solid #CBD5E1; font-size: 18px; text-align: right;" colspan="2">Загальна сума:</td>
                  <td style="padding: 16px; border: 1px solid #CBD5E1; font-size: 18px; text-align: center; color: #0891B2;">${dayTotal > 0 ? `${dayTotal.toFixed(2)}₴` : '-'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        `;
      });
      
      element.innerHTML = htmlContent;
      document.body.appendChild(element);
      
      // Настройки PDF
      const opt = {
        margin: 15,
        filename: `Меню_на_тиждень_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#FFFFFF'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Генерируем PDF
      await html2pdf().set(opt).from(element).save();
      
      // Удаляем временный элемент
      document.body.removeChild(element);
      
      toast.success('Меню експортовано в PDF');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Помилка при експорті в PDF');
    }
  };

  const getDishName = (dishId) => {
    const dish = dishes.find((d) => d.id === dishId);
    return dish ? dish.name : 'Невідома страва';
  };

  const getDishPrice = (dishId) => {
    const dish = dishes.find((d) => d.id === dishId);
    return dish ? dish.price : 0;
  };

  const getPriceInput = (dishId) => {
    if (dishId in priceInputs) return priceInputs[dishId];
    return Number(getDishPrice(dishId)).toFixed(2);
  };

  const handlePriceChange = (dishId, value) => {
    setPriceInputs((prev) => ({ ...prev, [dishId]: value }));
  };

  const handlePriceSave = (dishId) => {
    const value = priceInputs[dishId];
    if (value === undefined) return;
    const price = parseFloat(value);
    if (isNaN(price) || price < 0) return;
    updateDish.mutate({ id: dishId, price });
    setPriceInputs((prev) => {
      const next = { ...prev };
      delete next[dishId];
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground">Меню на тиждень</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-foreground text-nowrap">Початок тижня:</label>
            <DatePicker
              value={startDate}
              onChange={(date) => setStartDate(date)}
              className="w-auto"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
            >
              Експорт в PDF
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Зберегти
            </button>
          </div>
        </div>
      </div>

      {/* Вибір робочих днів через чекбокси */}
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm font-medium text-foreground mb-3">Виберіть робочі дні:</p>
        <div className="flex flex-wrap gap-4">
          {daysOfWeek.map((day) => (
            <label key={day.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDays.includes(day.id)}
                onChange={() => toggleDay(day.id)}
                className="w-4 h-4 text-primary rounded focus:ring-ring"
              />
              <span className="text-sm text-foreground">{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Таблиця меню */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase bg-muted border border-border w-24">
                Прийом їжі
              </th>
              {visibleDays.map((day) => (
                <th
                  key={day.id}
                  className="px-2 py-3 text-center text-sm font-semibold text-foreground bg-muted border border-border"
                >
                  <div>{day.label}</div>
                  <div className="text-xs font-normal text-muted-foreground">{day.dateStr}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((meal) => (
              <tr key={meal.id}>
                <td className="px-2 py-4 text-sm font-medium text-foreground bg-muted border border-border align-top">
                  {meal.label}
                </td>
                {visibleDays.map((day) => (
                  <td
                    key={`${day.id}-${meal.id}`}
                    className="px-2 py-2 border border-border align-top min-w-[180px]"
                  >
                    <div className="flex items-center gap-1">
                      <div className="flex-1 min-w-0">
                        <Autocomplete
                          key={`${day.id}-${meal.id}`}
                          options={getDishesForMealType(meal.id)}
                          value={menu[day.id]?.[meal.id]?.[0] || ''}
                          onChange={(dishId) => {
                            if (dishId) {
                              handleAddDish(day.id, meal.id, dishId);
                            }
                          }}
                          onCreate={async (name) => {
                            const newDishId = await handleCreateDish(name, meal.id);
                            if (newDishId) {
                              handleAddDish(day.id, meal.id, newDishId);
                            }
                          }}
                          creatable={true}
                          createLabel={(search) => `Створити страву "${search}"`}
                          placeholder="Обрати страву..."
                          labelKey="name"
                          valueKey="id"
                          searchKeys={['name']}
                          displayFormat={(d) => d.name}
                          emptyMessage="Немає страв. Введіть назву для створення."
                        />
                      </div>
                      {menu[day.id]?.[meal.id]?.[0] && (
                        <>
                          <input
                            type="number"
                            value={getPriceInput(menu[day.id][meal.id][0])}
                            onChange={(e) => handlePriceChange(menu[day.id][meal.id][0], e.target.value)}
                            onBlur={() => handlePriceSave(menu[day.id][meal.id][0])}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handlePriceSave(menu[day.id][meal.id][0]);
                            }}
                            className="w-20 text-sm px-2 py-2 border border-input rounded-lg bg-background text-center flex-shrink-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                            min="0"
                            step="0.5"
                          />
                          <span className="text-xs text-muted-foreground flex-shrink-0">₴</span>
                          <button
                            onClick={() => handleRemoveDish(day.id, meal.id, menu[day.id][meal.id][0])}
                            className="text-destructive hover:text-destructive/80 text-xs flex-shrink-0"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg max-w-md w-full p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Нова страва</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Назва</label>
                <input
                  type="text"
                  value={createModal.name}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-input bg-muted rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ціна (грн)</label>
                <input
                  type="number"
                  value={createModal.price}
                  onChange={(e) => setCreateModal((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                  min="0"
                  step="0.5"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateDishConfirm();
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateDishCancel}
                className="flex-1 py-2 px-4 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80"
              >
                Скасувати
              </button>
              <button
                onClick={handleCreateDishConfirm}
                className="flex-1 py-2 px-4 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90"
              >
                Створити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPlanner;