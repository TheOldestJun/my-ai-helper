'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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

const DirectorateOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, productId: null, orderId: null, reason: '' });

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

  const handleApprove = async (orderId, productId) => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || !user.id) {
      toast.error('Користувач не авторизований');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при погодженні пункту заявки');
      }

      toast.success('Пункт заявки успішно погоджено');
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async () => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || !user.id) {
      toast.error('Користувач не авторизований');
      return;
    }

    if (!rejectModal.reason.trim()) {
      toast.error('Вкажіть причину відмови');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${rejectModal.orderId}/products/${rejectModal.productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          userId: user.id,
          rejectionReason: rejectModal.reason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при відхиленні пункту заявки');
      }

      toast.success('Пункт заявки відхилено');
      setRejectModal({ open: false, productId: null, orderId: null, reason: '' });
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openRejectModal = (orderId, productId) => {
    setRejectModal({ open: true, orderId, productId, reason: '' });
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, productId: null, orderId: null, reason: '' });
  };

  // Flatten all products from all orders into a single list
  const allProducts = orders.flatMap(order =>
    order.products.map(product => ({
      ...product,
      orderNumber: order.number,
      orderPriority: order.priority,
      orderNotes: order.notes,
      orderCreatedAt: order.createdAt,
      orderId: order.id,
      createdBy: order.createdBy,
    }))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (allProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Немає пунктів заявок для розгляду</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allProducts.map((item) => (
        <div key={item.id} className="bg-card text-card-foreground p-4 rounded-lg border border-border shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">Заявка № {item.orderNumber}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[item.orderPriority]}`}>
                {priorityLabels[item.orderPriority]}
              </span>
              {item.createdBy && (
                <span className="text-xs text-muted-foreground">
                  Заявник: {item.createdBy.firstName} {item.createdBy.lastName}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(item.orderCreatedAt).toLocaleDateString('uk-UA')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex-1">
              <span className="font-medium text-foreground">{item.product.name}</span>
              <span className="text-muted-foreground ml-2">·</span>
              <span className="text-muted-foreground">{item.quantity} {item.unit.symbol}</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[item.status]}`}>
              {statusLabels[item.status]}
            </span>
          </div>

          {item.notes && (
            <p className="text-sm text-muted-foreground mb-3">{item.notes}</p>
          )}

          {item.orderNotes && (
            <p className="text-xs text-muted-foreground mb-3 italic">Примітки до заявки: {item.orderNotes}</p>
          )}

          {!item.approvedById && !item.rejectedById && (
            <div className="border-t border-border pt-3 mt-3 flex gap-2">
              <button
                onClick={() => handleApprove(item.orderId, item.id)}
                className="flex-1 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                Погодити
              </button>
              <button
                onClick={() => openRejectModal(item.orderId, item.id)}
                className="flex-1 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Відхилити
              </button>
            </div>
          )}

          {item.approvedById && (
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                <span className="font-medium">✓ Погоджено -</span>
                {item.approvedBy && (
                  <span>
                    {item.approvedBy.firstName} {item.approvedBy.lastName}
                    {item.approvedAt && ` · ${new Date(item.approvedAt).toLocaleDateString('uk-UA')}`}
                  </span>
                )}
              </p>
            </div>
          )}

          {item.rejectedById && (
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-red-600 dark:text-red-400">
                ✗ Відхилено: {item.rejectionReason}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Модальное окно для указания причины отмены */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg max-w-md w-full p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Причина відмови</h3>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground min-h-[100px] resize-none"
              placeholder="Вкажіть причину відмови..."
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={closeRejectModal}
                className="flex-1 py-2 px-4 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80"
              >
                Скасувати
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2 px-4 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90"
              >
                Відхилити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorateOrderList;
