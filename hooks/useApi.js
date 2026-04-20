import { useQuery } from '@tanstack/react-query';

/**
 * Хуки для получения данных с использованием TanStack Query
 * Все хуки кешируют данные на 1 минуту (staleTime в Providers.js)
 * При повторном запросе данные берутся из кеша для быстрого отображения
 * 
 * Использование в компонентах:
 * const { data, isLoading, error } = useOrders();
 * const orders = data?.orders || [];
 */
// ==================== ORDERS ====================
/**
 * Загружает все заявки текущего пользователя
 * Используется в OrderList для заявителей и DirectorateOrderList для директора
 * 
 * @param {number|null} userId - ID пользователя, для которого загружаются заявки
 * @returns {object} Результат запроса с данными { orders: [...] }
 */
export const useOrders = (userId = null) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      const url = userId ? `/api/orders?userId=${userId}` : '/api/orders';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Помилка при отриманні заявок');
      }
      return response.json();
    },
  });
};

/**
 * Загружает одобренные пункты заявок для исполнителей (снабжение, склад)
 * Используется в ExecutorOrderList для отображения товаров, которые нужно заказать/получить
 * 
 * @returns {object} Результат запроса с данными { products: [...] }
 */
export const useApprovedProducts = () => {
  return useQuery({
    queryKey: ['approved-products'],
    queryFn: async () => {
      const response = await fetch('/api/orders/approved-products');
      if (!response.ok) {
        throw new Error('Помилка при отриманні схвалених товарів');
      }
      return response.json();
    },
  });
};

/**
 * Загружает товары в статусе IN_TRANSIT и выше для склада
 * Используется в WarehouseOrderList для отображения товаров, которые прибыли на склад
 * 
 * @returns {object} Результат запроса с данными { products: [...] }
 */
export const useWarehouseProducts = () => {
  return useQuery({
    queryKey: ['warehouse-products'],
    queryFn: async () => {
      const response = await fetch('/api/orders/warehouse-products');
      if (!response.ok) {
        throw new Error('Помилка при отриманні товарів на складі');
      }
      return response.json();
    },
  });
};

// ==================== KITCHEN ====================

/**
 * Загружает список всех страв для планирования меню
 * Используется в MenuPlanner для выбора страв
 * 
 * @returns {object} Результат запроса с данными { dishes: [...] }
 */
export const useDishes = () => {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: async () => {
      const response = await fetch('/api/dishes');
      if (!response.ok) {
        throw new Error('Помилка при отриманні страв');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 минут - статические данные редко меняются
  });
};

// ==================== PRODUCTS & UNITS ====================

/**
 * Загружает список всех товаров
 * Используется в OrderCreationForm для выбора товаров при создании заявки
 * 
 * @returns {object} Результат запроса с данными { products: [...] }
 */
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Помилка при отриманні товарів');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 минут - статические данные редко меняются
  });
};

/**
 * Загружает список всех единиц измерения
 * Используется в OrderCreationForm для выбора единиц измерения
 * 
 * @returns {object} Результат запроса с данными { units: [...] }
 */
export const useUnits = () => {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const response = await fetch('/api/units');
      if (!response.ok) {
        throw new Error('Помилка при отриманні одиниць виміру');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 минут - статические данные редко меняются
  });
};

// ==================== USERS ====================

/**
 * Загружает список всех пользователей
 * Может использоваться для отображения информации о пользователях
 * 
 * @returns {object} Результат запроса с данными { users: [...] }
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Помилка при отриманні користувачів');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 минут - пользователи меняются реже чем заявки
  });
};

/**
 * Загружает архивные заявки (только для снабжения)
 * Используется в ArchiveOrders компоненте для отображения архивных заявок
 * Архивные заявки хранятся не старше 3 лет
 * 
 * @param {number} userId - ID пользователя снабжения
 * @returns {object} Результат запроса с данными { orders: [...] }
 */
export const useArchivedOrders = (userId) => {
  return useQuery({
    queryKey: ['archived-orders', userId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/archived?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Помилка при отриманні архівних заявок');
      }
      return response.json();
    },
    enabled: !!userId,
  });
};