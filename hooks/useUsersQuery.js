import { useQuery } from '@tanstack/react-query';

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
    staleTime: 5 * 60 * 1000,
  });
};
