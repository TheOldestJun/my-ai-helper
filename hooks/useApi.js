import { useQuery } from '@tanstack/react-query';

// Orders hooks
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

export const useApprovedProducts = () => {
  return useQuery({
    queryKey: ['approved-products'],
    queryFn: async () => {
      const response = await fetch('/api/orders/approved-products');
      if (!response.ok) {
        throw new Error('Помилка при отриманні схвалених заявок');
      }
      return response.json();
    },
  });
};

export const useWarehouseProducts = () => {
  return useQuery({
    queryKey: ['warehouse-products'],
    queryFn: async () => {
      const response = await fetch('/api/orders/warehouse-products');
      if (!response.ok) {
        throw new Error('Помилка при отриманні заявок для складу');
      }
      return response.json();
    },
  });
};

// Kitchen/Dishes hooks
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
  });
};

// Products hook
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
  });
};

// Units hook
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
  });
};

// Users hook
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
  });
};
