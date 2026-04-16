import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Order mutations
export const useApproveOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, userId }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          userId,
        }),
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
        return {
          ...old,
          orders: old.orders.map(order => 
            order.id === orderId ? { ...order, status: 'APPROVED' } : order
          ),
        };
      });
      
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Заявку погоджено');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

export const useRejectOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, userId, rejectionReason }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          userId,
          rejectionReason,
        }),
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
        return {
          ...old,
          orders: old.orders.map(order => 
            order.id === orderId ? { ...order, status: 'REJECTED', rejectionReason } : order
          ),
        };
      });
      
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Заявку відхилено');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
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
        return {
          ...old,
          orders: old.orders.filter(order => order.id !== orderId),
        };
      });
      
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Заявку видалено');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

// OrderProduct mutations
export const useChangeProductStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, productId, status, userId }) => {
      const response = await fetch(`/api/orders/${orderId}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'changeStatus',
          status,
          userId,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при зміні статусу');
      }
      return response.json();
    },
    onMutate: async ({ orderId, productId, status }) => {
      await queryClient.cancelQueries(['approved-products']);
      await queryClient.cancelQueries(['warehouse-products']);
      
      const previousApproved = queryClient.getQueryData(['approved-products']);
      const previousWarehouse = queryClient.getQueryData(['warehouse-products']);
      
      queryClient.setQueryData(['approved-products'], (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.map(p => 
            p.id === productId ? { ...p, status } : p
          ),
        };
      });
      
      queryClient.setQueryData(['warehouse-products'], (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.map(p => 
            p.id === productId ? { ...p, status } : p
          ),
        };
      });
      
      return { previousApproved, previousWarehouse };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['approved-products'], context.previousApproved);
      queryClient.setQueryData(['warehouse-products'], context.previousWarehouse);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Статус змінено');
    },
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
      const response = await fetch(`/api/orders/${orderId}/products/${productId}`, {
        method: 'DELETE',
      });
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
        return {
          ...old,
          orders: old.orders.map(order => ({
            ...order,
            products: order.products.filter(p => p.id !== productId),
          })),
        };
      });
      
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Пункт видалено');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

export const useApproveProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, productId, userId }) => {
      const response = await fetch(`/api/orders/${orderId}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          userId,
        }),
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
        return {
          ...old,
          orders: old.orders.map(order => ({
            ...order,
            products: order.products.map(p => 
              p.id === productId ? { ...p, status: 'APPROVED' } : p
            ),
          })),
        };
      });
      
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Пункт заявки успішно погоджено');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

export const useRejectProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, productId, userId, rejectionReason }) => {
      const response = await fetch(`/api/orders/${orderId}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          userId,
          rejectionReason,
        }),
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
        return {
          ...old,
          orders: old.orders.map(order => ({
            ...order,
            products: order.products.map(p => 
              p.id === productId ? { ...p, status: 'REJECTED', rejectionReason } : p
            ),
          })),
        };
      });
      
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Пункт заявки відхилено');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

// Product creation mutation
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
    onSuccess: (data) => {
      toast.success(`Товар "${data.product.name}" успішно створено`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};

// Order creation mutation
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при створенні заявки');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Заявку №${data.order.number} успішно створено`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

// Order update mutation
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, orderData }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Dish mutations
export const useCreateDish = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dishData) => {
      const response = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при створенні страви');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Страву "${data.dish.name}" успішно створено`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['dishes']);
    },
  });
};

export const useDeleteDish = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dishId) => {
      const response = await fetch(`/api/dishes/${dishId}`, {
        method: 'DELETE',
      });
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
        return {
          ...old,
          dishes: old.dishes.filter(dish => dish.id !== dishId),
        };
      });
      
      return { previousDishes };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['dishes'], context.previousDishes);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Страву видалено');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['dishes']);
    },
  });
};
