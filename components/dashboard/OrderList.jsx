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
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  ORDERED: 'bg-purple-100 text-purple-700',
  PAID: 'bg-green-100 text-green-700',
  IN_TRANSIT: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-slate-100 text-slate-700',
};

const priorityLabels = {
  LOW: 'Низький',
  NORMAL: 'Нормальний',
  HIGH: 'Високий',
  URGENT: 'Терміновий',
};

const priorityColors = {
  LOW: 'bg-slate-100 text-slate-600',
  NORMAL: 'bg-blue-50 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">У вас поки немає замовлень</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900">№ {order.number}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[order.priority]}`}>
                {priorityLabels[order.priority]}
              </span>
            </div>
            <span className="text-sm text-slate-500">
              {new Date(order.createdAt).toLocaleDateString('uk-UA')}
            </span>
          </div>

          {order.notes && (
            <p className="text-sm text-slate-600 mb-3">{order.notes}</p>
          )}

          {order.products && order.products.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Товари:</p>
              <ul className="space-y-2">
                {order.products.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{item.product.name}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">{item.quantity} {item.unit.symbol}</span>
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
