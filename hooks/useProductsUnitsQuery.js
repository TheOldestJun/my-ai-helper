import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '@/lib/client-auth';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products', { headers: getAuthHeaders() });
      if (!response.ok) {
        throw new Error('Помилка при отриманні товарів');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useUnits = () => {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const response = await fetch('/api/units', { headers: getAuthHeaders() });
      if (!response.ok) {
        throw new Error('Помилка при отриманні одиниць виміру');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });
};
