import { useQuery } from '@tanstack/react-query';

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
    staleTime: 10 * 60 * 1000,
  });
};
