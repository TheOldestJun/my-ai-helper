import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/client-auth';

export const useCreateDish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dishData) => {
      const response = await fetch('/api/dishes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dishData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при створенні страви');
      }
      return response.json();
    },
    onSuccess: (data) => toast.success(`Страву "${data.dish.name}" успішно створено`),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries(['dishes']),
  });
};

export const useUpdateDish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await fetch(`/api/dishes/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || 'Помилка при оновленні страви');
      }
      return response.json();
    },
    onSuccess: () => toast.success('Ціну страви оновлено'),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries(['dishes']),
  });
};

export const useDeleteDish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dishId) => {
      const response = await fetch(`/api/dishes/${dishId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при видаленні страви');
      }
      return response.json();
    },
    onMutate: async (dishId) => {
      await queryClient.cancelQueries(['dishes']);
      const previousDishes = queryClient.getQueryData(['dishes']);
      queryClient.setQueryData(['dishes'], (old) => {
        if (!old) return old;
        return { ...old, dishes: old.dishes.filter(dish => dish.id !== dishId) };
      });
      return { previousDishes };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['dishes'], context.previousDishes);
      toast.error(error.message);
    },
    onSuccess: () => toast.success('Страву видалено'),
    onSettled: () => queryClient.invalidateQueries(['dishes']),
  });
};
