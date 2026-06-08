import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '@/lib/client-auth';

export const useDishes = () => {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: async () => {
      const response = await fetch('/api/dishes', { headers: getAuthHeaders() });
      if (!response.ok) {
        throw new Error('Помилка при отриманні страв');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });
};
