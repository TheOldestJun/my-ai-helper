import { useQuery } from '@tanstack/react-query';

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
        throw new Error('Помилка при отриманні схвалених товарів');
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
        throw new Error('Помилка при отриманні товарів на складі');
      }
      return response.json();
    },
  });
};

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
