'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, ShoppingCart, CreditCard, Truck, CircleCheck, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { useApprovedProducts, useWarehouseProducts } from '../../../hooks/useApi';
import { useChangeProductStatus } from '../../../hooks/useMutations';

/**
 * ExecutorOrderList - Компонент для исполнителей (снабжение, склад)
 * Используется в SupplyDashboard и WarehouseDashboard
 * 
 * Функционал:
 * - Отображение одобренных товаров для заказа (снабжение)
 * - Отображение товаров в пути и прибывших (склад)
 * - Изменение статуса товаров через dropdown
 * - Группировка товаров по номеру заявки
 * - Отображение приоритетов и примечаний
 * 
 * Хуки TanStack Query:
 * - useApprovedProducts: загрузка одобренных товаров
 * - useWarehouseProducts: загрузка товаров на складе
 * - useChangeProductStatus: изменение статуса товара
 */

const statusIcons = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  ORDERED: ShoppingCart,
  PAID: CreditCard,
  IN_TRANSIT: Truck,
  COMPLETED: CircleCheck,
  CANCELLED: X,
};

const statusLabels = {
  PENDING: 'Очікує',
  APPROVED: 'Схвалено',
  REJECTED: 'Відхилено',
  ORDERED: 'Замовлено',
  PAID: 'Сплачено',
  IN_TRANSIT: 'В дорозі',
  COMPLETED: 'Виконано',
  CANCELLED: 'Скасовано',
};

const statusColors = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  APPROVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  ORDERED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  PAID: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  IN_TRANSIT: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  COMPLETED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  CANCELLED: 'bg-muted text-muted-foreground',
};

const priorityLabels = {
  LOW: 'Низький',
  NORMAL: 'Нормальний',
  HIGH: 'Високий',
  URGENT: 'Терміновий',
};

const priorityColors = {
  LOW: 'bg-muted text-muted-foreground',
  NORMAL: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
  HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  URGENT: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const ExecutorOrderList = () => {
  const queryClient = useQueryClient();
  const { data: approvedProductsData, isLoading: loading } = useApprovedProducts();
  const changeProductStatus = useChangeProductStatus();
  const [statusDropdown, setStatusDropdown] = useState({ open: false, itemId: null });

  const approvedProducts = approvedProductsData?.products || [];

  const handleStatusChange = (orderId, productId, newStatus) => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || !user.id) {
      toast.error('Користувач не авторизований');
      return;
    }

    changeProductStatus.mutate(
      { orderId, productId, status: newStatus, userId: user.id },
      {
        onSuccess: () => {
          setStatusDropdown({ open: false, itemId: null });
        },
      }
    );
  };

  const toggleStatusDropdown = (itemId) => {
    setStatusDropdown(prev => ({ open: !prev.open, itemId: prev.open ? null : itemId }));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.status-dropdown')) {
        setStatusDropdown({ open: false, itemId: null });
      }
    };

    if (statusDropdown.open) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [statusDropdown.open]);

  // Группируем заявки по номеру
  const groupedOrders = approvedProducts.reduce((acc, item) => {
    if (!acc[item.orderNumber]) {
      acc[item.orderNumber] = {
        orderNumber: item.orderNumber,
        orderPriority: item.orderPriority,
        orderCreatedAt: item.orderCreatedAt,
        orderNotes: null,
        items: [],
      };
    }
    if (item.orderNotes) {
      acc[item.orderNumber].orderNotes = item.orderNotes;
    }
    acc[item.orderNumber].items.push(item);
    return acc;
  }, {});

  const ordersArray = Object.values(groupedOrders);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (approvedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Немає схвалених заявок для виконання</p>
      </div>
    );
  }

  const availableStatuses = ['APPROVED', 'ORDERED', 'PAID', 'IN_TRANSIT', 'COMPLETED'];

  return (
    <div className="space-y-4">
      {ordersArray.map((order) => (
        <div key={order.orderNumber} className="bg-card text-card-foreground p-4 rounded-lg border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="font-semibold text-foreground">Заявка №{order.orderNumber}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[order.orderPriority]}`}>
              {priorityLabels[order.orderPriority]}
            </span>
            <span className="text-sm text-muted-foreground">
              {new Date(order.orderCreatedAt).toLocaleDateString('uk-UA')}
            </span>
            {order.orderNotes && (
              <span className="text-sm text-red-600/80 dark:text-red-400/80 italic">
                {order.orderNotes}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{item.productName}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{item.quantity} {item.unitSymbol}</span>
                  {item.notes && (
                    <span className="text-xs text-muted-foreground italic font-medium">({item.notes})</span>
                  )}
                </div>
                <div className="status-dropdown relative">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => toggleStatusDropdown(item.id)}
                      className={`px-2 py-1 text-xs font-medium rounded cursor-pointer hover:opacity-80 transition-opacity ${statusColors[item.status]} flex items-center gap-1`}
                    >
                      {React.createElement(statusIcons[item.status], { className: 'w-3 h-3' })}
                      {statusLabels[item.status]}
                      {item.statusChangedBy && item.statusChangedAt && (
                        <span className="text-xs text-muted-foreground">
                          - {item.statusChangedBy.firstName} {item.statusChangedBy.lastName} · {new Date(item.statusChangedAt).toLocaleDateString('uk-UA')}
                        </span>
                      )}
                    </button>
                    {item.approvedBy && item.approvedAt && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ✓ Погоджено - {item.approvedBy.firstName} {item.approvedBy.lastName} · {new Date(item.approvedAt).toLocaleDateString('uk-UA')}
                      </div>
                    )}
                  </div>
                  {statusDropdown.open && statusDropdown.itemId === item.id && (
                    <div className="absolute right-0 top-full mt-1 bg-card text-card-foreground border border-border rounded-lg shadow-lg z-10 min-w-[150px]">
                      {availableStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(item.orderId, item.id, status)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 ${
                            status === item.status ? 'bg-muted/50 font-medium' : ''
                          }`}
                        >
                          {React.createElement(statusIcons[status], { className: 'w-4 h-4' })}
                          {statusLabels[status]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExecutorOrderList;