import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Хуки для мутаций (изменения данных) с использованием TanStack Query
 * Все мутации имеют оптимистичные обновления - UI обновляется мгновенно
 * При ошибке изменения откатываются
 * После успешного выполнения кеш инвалидизируется (данные обновляются с сервера)
 * 
 * Использование в компонентах:
 * const mutation = useApproveOrder();
 * mutation.mutate({ orderId, userId });
 * 
 * Или с callback:
 * mutation.mutate({ orderId, userId }, {
 *   onSuccess: () => console.log('Success'),
 * });
 */

// ==================== ORDER MUTATIONS ====================

/**
 * Одобряет заявку целиком
 * Используется в DirectorateOrderList для одобрения заявки директором
 * 
 * @param {object} params - { orderId: number, userId: number }
 */
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

/**
 * Отклоняет заявку целиком с причиной
 * Используется в DirectorateOrderList для отклонения заявки директором
 * 
 * @param {object} params - { orderId: number, userId: number, rejectionReason: string }
 */
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

/**
 * Удаляет заявку (только отклоненные заявки)
 * Используется в OrderList для удаления отклоненных заявок
 * 
 * @param {number} orderId - ID заявки для удаления
 */
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

// ==================== ORDER PRODUCT MUTATIONS ====================

/**
 * Изменяет статус отдельного пункта заявки
 * Используется в ExecutorOrderList и WarehouseOrderList для изменения статуса товаров
 * Поддерживаемые статусы: ORDERED, PAID, IN_TRANSIT, RECEIVED, CANCELLED
 * Статус RECEIVED может устанавливать только склад
 * 
 * @param {object} params - { orderId: number, productId: number, status: string, userId: number }
 */
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

/**
 * Удаляет отдельный пункт из заявки (только отклоненные пункты)
 * Используется в OrderList для удаления отклоненных пунктов
 * 
 * @param {object} params - { orderId: number, productId: number }
 */
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

/**
 * Одобряет отдельный пункт заявки
 * Используется в DirectorateOrderList для одобрения пункта директором
 * 
 * @param {object} params - { orderId: number, productId: number, userId: number }
 */
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

/**
 * Отклоняет отдельный пункт заявки с причиной
 * Используется в DirectorateOrderList для отклонения пункта директором
 * 
 * @param {object} params - { orderId: number, productId: number, userId: number, rejectionReason: string }
 */
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

// ==================== PRODUCT MUTATIONS ====================

/**
 * Создает новый товар
 * Используется в OrderCreationForm при создании товара из autocomplete
 * 
 * @param {string} productName - Название нового товара
 */
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

// ==================== ORDER CREATION MUTATIONS ====================

/**
 * Создает новую заявку
 * Используется в OrderCreationForm для создания заявок
 * 
 * @param {object} orderData - { priority: string, notes: string, userId: number, products: array }
 */
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

// ==================== DISH MUTATIONS ====================

/**
 * useCreateDish - Создает новую страву
 * Используется в MenuPlanner при создании стравы из autocomplete
 * 
 * @param {object} dishData - { name: string, type: string }
 */
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

/**
 * Удаляет страву
 * Используется в MenuPlanner для удаления страв
 * 
 * @param {number} dishId - ID стравы для удаления
 */
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

/**
 * Архивирует заявку
 * Используется заявителем для закрытия заявки после получения всех товаров
 * Только заявитель может архивировать свои заявки
 * Заявка должна иметь статус RECEIVED для всех товаров
 * 
 * @param {object} params - { orderId: number, userId: number }
 */
export const useArchiveOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, userId }) => {
      const response = await fetch(`/api/orders/${orderId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
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
        return {
          ...old,
          orders: old.orders.filter(o => o.id !== orderId),
        };
      });
      
      return { previousOrders };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Заявку успішно архівовано');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['archived-orders']);
    },
  });
};
