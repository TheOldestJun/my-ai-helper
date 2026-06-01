import { useQuery } from '@tanstack/react-query';

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
    staleTime: 10 * 60 * 1000,
  });
};

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
    staleTime: 10 * 60 * 1000,
  });
};
