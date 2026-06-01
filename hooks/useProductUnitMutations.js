import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productName) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName }),
      });
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          throw new Error('Товар з такою назвою вже існує');
        }
        throw new Error(data.error || 'Помилка при створенні товару');
      }
      return response.json();
    },
    onSuccess: (data) => toast.success(`Товар "${data.product.name}" успішно створено`),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries(['products']),
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unitData) => {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData),
      });
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          throw new Error('Одиниця виміру з такою назвою або символом вже існує');
        }
        throw new Error(data.error || 'Помилка при створенні одиниці виміру');
      }
      return response.json();
    },
    onSuccess: (data) => toast.success(`Одиницю "${data.unit.symbol}" успішно створено`),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries(['units']),
  });
};
