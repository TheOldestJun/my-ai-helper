import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '@/lib/client-auth';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders', { headers: getAuthHeaders() });
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
      const response = await fetch('/api/orders/approved-products', { headers: getAuthHeaders() });
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
      const response = await fetch('/api/orders/warehouse-products', { headers: getAuthHeaders() });
      if (!response.ok) {
        throw new Error('Помилка при отриманні товарів на складі');
      }
      return response.json();
    },
  });
};

export const useArchivedOrders = (page = 1) => {
  return useQuery({
    queryKey: ['archived-orders', page],
    queryFn: async () => {
      const response = await fetch(`/api/orders/archived?page=${page}`, { headers: getAuthHeaders() });
      if (!response.ok) {
        throw new Error('Помилка при отриманні архівних заявок');
      }
      return response.json();
    },
  });
};
