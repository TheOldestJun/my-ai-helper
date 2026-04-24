'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import Autocomplete from '@/components/Autocomplete';
import { useDishes } from '../../../hooks/useApi';
import { useCreateDish } from '../../../hooks/useMutations';

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
  const [menu, setMenu] = useState({});
  const [selectedDays, setSelectedDays] = useState(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [startDate, setStartDate] = useState(() => {
    // Default to current week's Monday
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  const dishes = dishesData?.dishes || [];

  // Calculate dates for each day based on start date
  const getDayDate = (dayId) => {
    const dayOffsets = {
      'monday': 0,
      'tuesday': 1,
      'wednesday': 2,
      'thursday': 3,
      'friday': 4,
    };
    const start = new Date(startDate);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + dayOffsets[dayId]);
    return targetDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
  };

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

  // Фільтруємо дні тижня залежно від вибору
  const visibleDays = daysOfWeek.filter((day) => selectedDays.includes(day.id));

  const toggleDay = (dayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  };
  useEffect(() => {
    const saved = localStorage.getItem('weeklyMenu');
    if (saved) {
      try {
        setMenu(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse menu');
      }
    }
    const savedDays = localStorage.getItem('selectedDays');
    if (savedDays) {
      try {
        setSelectedDays(JSON.parse(savedDays));
      } catch (e) {
        console.error('Failed to parse selectedDays');
      }
    }
  }, []);

  // Зберігаємо вибрані дні
  useEffect(() => {
    localStorage.setItem('selectedDays', JSON.stringify(selectedDays));
  }, [selectedDays]);

  const handleAddDish = (day, mealType, dishId) => {
    if (!dishId) return;

    setMenu((prev) => {
      const dayMenu = prev[day] || {};
      const mealDishes = dayMenu[mealType] || [];
      
      // Перевіряємо чи страва вже додана
      if (mealDishes.includes(dishId)) {
        toast.info('Ця страва вже додана');
        return prev;
      }

      const newMenu = {
        ...prev,
        [day]: {
          ...dayMenu,
          [mealType]: [...mealDishes, dishId],
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
    const typeMapping = {
      'soup': 'SOUP',
      'garnish': 'GARNISH',
      'meat': 'MEAT',
      'salad': 'SALAD',
      'bakery': 'BAKERY',
      'drink': 'DRINK',
    };
    const dishType = typeMapping[mealTypeId];
    
    return createDish.mutateAsync({ name: dishName, type: dishType })
      .then((data) => {
        return data.dish.id;
      })
      .catch(() => {
        return null;
      });
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
        const dayDate = getDayDate(day.id);
        
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
                </tr>
              </thead>
              <tbody>
        `;
        
        mealTypes.forEach((meal, index) => {
          const dishesList = menu[day.id]?.[meal.id] || [];
          const dishNames = dishesList.map(id => getDishName(id)).join(' або ') || '-';
          const bgColor = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
          const borderColor = index % 2 === 0 ? '#E2E8F0' : '#CBD5E1';
          
          htmlContent += `
            <tr style="background-color: ${bgColor}; color: #000000;">
              <td style="padding: 16px; border: 1px solid ${borderColor}; font-weight: bold; color: #0891B2; font-size: 18px;">${meal.label}</td>
              <td style="padding: 16px; border: 1px solid ${borderColor}; font-size: 18px;">${dishNames}</td>
            </tr>
          `;
        });
        
        htmlContent += `
              </tbody>
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
            <label className="text-sm text-foreground">Початок тижня:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  {day.label}
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
                    <div className="space-y-2">
                      {/* Список страв */}
                      <ul className="space-y-1">
                        {(menu[day.id]?.[meal.id] || []).map((dishId) => (
                          <li
                            key={dishId}
                            className="flex items-center justify-between bg-primary/10 px-2 py-1 rounded text-sm"
                          >
                            <span className="text-foreground truncate">{getDishName(dishId)}</span>
                            <button
                              onClick={() => handleRemoveDish(day.id, meal.id, dishId)}
                              className="text-destructive hover:text-destructive/80 text-xs ml-1 flex-shrink-0"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>

                      {/* Autocomplete для додавання страви */}
                      <Autocomplete
                        key={`${day.id}-${meal.id}-${(menu[day.id]?.[meal.id] || []).length}`}
                        options={getDishesForMealType(meal.id)}
                        value=""
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
                        placeholder="Додати страву..."
                        labelKey="name"
                        valueKey="id"
                        searchKeys={['name']}
                        displayFormat={(d) => d.name}
                        emptyMessage="Немає страв. Введіть назву для створення."
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuPlanner;