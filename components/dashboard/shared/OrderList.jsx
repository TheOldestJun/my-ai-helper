'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const statusLabels = {
  PENDING: 'Очікує',
  APPROVED: 'Схвалено',
  REJECTED: 'Відхилено',
  ORDERED: 'Замовлено',
  PAID: 'Оплачено',
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

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Не вдалося отримати замовлення');
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">У вас поки немає замовлень</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-card text-card-foreground p-4 rounded-lg border border-border shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">№ {order.number}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[order.priority]}`}>
                {priorityLabels[order.priority]}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString('uk-UA')}
            </span>
          </div>

          {order.notes && (
            <p className="text-sm text-muted-foreground mb-3">{order.notes}</p>
          )}

          {order.products && order.products.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Товари:</p>
              <ul className="space-y-2">
                {order.products.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.product.name}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{item.quantity} {item.unit.symbol}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderList;
