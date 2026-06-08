import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/client-auth';

export const useChangeProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, productId, status }) => {
      const response = await fetch(`/api/orders/${orderId}/products/${productId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'changeStatus', status }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при зміні статусу');
      }
      return response.json();
    },
    onMutate: async ({ productId, status }) => {
      await queryClient.cancelQueries(['approved-products']);
      await queryClient.cancelQueries(['warehouse-products']);

      const previousApproved = queryClient.getQueryData(['approved-products']);
      const previousWarehouse = queryClient.getQueryData(['warehouse-products']);

      queryClient.setQueryData(['approved-products'], (old) => {
        if (!old) return old;
        return { ...old, products: old.products.map(p => p.id === productId ? { ...p, status } : p) };
      });
      queryClient.setQueryData(['warehouse-products'], (old) => {
        if (!old) return old;
        return { ...old, products: old.products.map(p => p.id === productId ? { ...p, status } : p) };
      });

      return { previousApproved, previousWarehouse };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['approved-products'], context.previousApproved);
      queryClient.setQueryData(['warehouse-products'], context.previousWarehouse);
      toast.error(error.message);
    },
    onSuccess: () => toast.success('Статус змінено'),
    onSettled: () => {
      queryClient.invalidateQueries(['approved-products']);
      queryClient.invalidateQueries(['warehouse-products']);
    },
  });
};

export const useDeleteOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, productId }) => {
      const response = await fetch(`/api/orders/${orderId}/products/${productId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при видаленні пункту');
      }
      return response.json();
    },
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries(['orders']);
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], (old) => {
        if (!old) return old;
        return { ...old, orders: old.orders.map(order => ({ ...order, products: order.products.filter(p => p.id !== productId) })) };
      });
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => toast.success('Пункт видалено'),
    onSettled: () => queryClient.invalidateQueries(['orders']),
  });
};

export const useApproveProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, productId }) => {
      const response = await fetch(`/api/orders/${orderId}/products/${productId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при погодженні пункту заявки');
      }
      return response.json();
    },
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries(['orders']);
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], (old) => {
        if (!old) return old;
        return { ...old, orders: old.orders.map(order => ({ ...order, products: order.products.map(p => p.id === productId ? { ...p, status: 'APPROVED' } : p) })) };
      });
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => toast.success('Пункт заявки успішно погоджено'),
    onSettled: () => queryClient.invalidateQueries(['orders']),
  });
};

export const useRejectProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, productId, rejectionReason }) => {
      const response = await fetch(`/api/orders/${orderId}/products/${productId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'reject', rejectionReason }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при відхиленні пункту заявки');
      }
      return response.json();
    },
    onMutate: async ({ productId, rejectionReason }) => {
      await queryClient.cancelQueries(['orders']);
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], (old) => {
        if (!old) return old;
        return { ...old, orders: old.orders.map(order => ({ ...order, products: order.products.map(p => p.id === productId ? { ...p, status: 'REJECTED', rejectionReason } : p) })) };
      });
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => toast.success('Пункт заявки відхилено'),
    onSettled: () => queryClient.invalidateQueries(['orders']),
  });
};
