import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/client-auth';

export const useApproveOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при погодженні заявки');
      }
      return response.json();
    },
    onMutate: async ({ orderId }) => {
      await queryClient.cancelQueries(['orders']);
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], (old) => {
        if (!old) return old;
        return { ...old, orders: old.orders.map(order => order.id === orderId ? { ...order, status: 'APPROVED' } : order) };
      });
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => toast.success('Заявку погоджено'),
    onSettled: () => queryClient.invalidateQueries(['orders']),
  });
};

export const useRejectOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, rejectionReason }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'reject', rejectionReason }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при відхиленні заявки');
      }
      return response.json();
    },
    onMutate: async ({ orderId, rejectionReason }) => {
      await queryClient.cancelQueries(['orders']);
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], (old) => {
        if (!old) return old;
        return { ...old, orders: old.orders.map(order => order.id === orderId ? { ...order, status: 'REJECTED', rejectionReason } : order) };
      });
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => toast.success('Заявку відхилено'),
    onSettled: () => queryClient.invalidateQueries(['orders']),
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId) => {
      const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при видаленні заявки');
      }
      return response.json();
    },
    onMutate: async (orderId) => {
      await queryClient.cancelQueries(['orders']);
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], (old) => {
        if (!old) return old;
        return { ...old, orders: old.orders.filter(order => order.id !== orderId) };
      });
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => toast.success('Заявку видалено'),
    onSettled: () => queryClient.invalidateQueries(['orders']),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при створенні заявки');
      }
      return response.json();
    },
    onSuccess: (data) => toast.success(`Заявку №${data.order.number} успішно створено`),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries(['orders']),
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, orderData }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при оновленні заявки');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Заявку успішно оновлено');
      queryClient.invalidateQueries(['orders']);
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useArchiveOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await fetch(`/api/orders/${orderId}/archive`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при архівуванні заявки');
      }
      return response.json();
    },
    onMutate: async ({ orderId }) => {
      await queryClient.cancelQueries(['orders']);
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], (old) => {
        if (!old) return old;
        return { ...old, orders: old.orders.filter(o => o.id !== orderId) };
      });
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => toast.success('Заявку успішно архівовано'),
    onSettled: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['archived-orders']);
    },
  });
};
