'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, ShoppingCart, CreditCard, Truck, CircleCheck, X } from 'lucide-react';
import { toast } from 'sonner';

import OrderItemEditForm from './OrderItemEditForm';

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

const OrderList = ({ showActions = false, allowEdit = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, orderId: null, reason: '' });
  const [editModal, setEditModal] = useState({ open: false, item: null, orderId: null });
  const [cancelModal, setCancelModal] = useState({ open: false, itemId: null, orderId: null });
  const [deleteOrderModal, setDeleteOrderModal] = useState({ open: false, orderId: null });

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

  const handleApprove = async (orderId) => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || !user.id) {
      toast.error('Користувач не авторизований');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при погодженні заявки');
      }

      toast.success('Заявку успішно погоджено');
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
      const response = await fetch(`/api/orders/${rejectModal.orderId}`, {
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
        throw new Error(data.error || 'Помилка при відхиленні заявки');
      }

      toast.success('Заявку відхилено');
      setRejectModal({ open: false, orderId: null, reason: '' });
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openRejectModal = (orderId) => {
    setRejectModal({ open: true, orderId, reason: '' });
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, orderId: null, reason: '' });
  };

  const openEditModal = (item, orderId) => {
    setEditModal({ open: true, item, orderId });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, item: null, orderId: null });
  };

  const openCancelModal = (itemId, orderId) => {
    setCancelModal({ open: true, itemId, orderId });
  };

  const closeCancelModal = () => {
    setCancelModal({ open: false, itemId: null, orderId: null });
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/orders/${cancelModal.orderId}/products/${cancelModal.itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при скасуванні пункту заявки');
      }

      toast.success('Пункт заявки успішно скасовано');
      closeCancelModal();
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openDeleteOrderModal = (orderId) => {
    setDeleteOrderModal({ open: true, orderId });
  };

  const closeDeleteOrderModal = () => {
    setDeleteOrderModal({ open: false, orderId: null });
  };

  const handleDeleteOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${deleteOrderModal.orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка при видаленні заявки');
      }

      toast.success('Заявку успішно видалено');
      closeDeleteOrderModal();
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

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

          {allowEdit && (order.rejectedById || (order.products && order.products.some(item => item.rejectedById))) && (
            <div className="mb-3">
              <button
                onClick={() => openDeleteOrderModal(order.id)}
                className="text-sm text-destructive hover:text-destructive/80 font-medium"
              >
                Видалити заявку
              </button>
            </div>
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
                      {item.notes && (
                        <span className="text-xs text-muted-foreground italic font-medium">({item.notes})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.approvedById && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
                          ✓ Погоджено {item.approvedBy && `· ${item.approvedBy.firstName} ${item.approvedBy.lastName}`}
                        </span>
                      )}
                      {item.rejectedById && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          ✗ {item.rejectionReason}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[item.status]} flex items-center gap-1`}>
                        {React.createElement(statusIcons[item.status], { className: 'w-3 h-3' })}
                        {statusLabels[item.status]}
                        {item.statusChangedBy && (
                          <span className="text-xs text-muted-foreground">
                            - {item.statusChangedBy.firstName} {item.statusChangedBy.lastName}
                          </span>
                        )}
                      </span>
                      {allowEdit && item.rejectedById && (
                        <button
                          onClick={() => openEditModal(item, order.id)}
                          className="text-xs text-primary hover:text-primary/80 font-medium"
                        >
                          Редагувати
                        </button>
                      )}
                      {allowEdit && !item.approvedById && (
                        <button
                          onClick={() => openCancelModal(item.id, order.id)}
                          className="text-lg text-destructive hover:text-destructive/80 font-medium leading-none"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
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

      {/* Модальное окно редактирования пункта заявки */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-border">
            <OrderItemEditForm
              item={editModal.item}
              orderId={editModal.orderId}
              onSave={() => {
                closeEditModal();
                fetchOrders();
              }}
              onCancel={closeEditModal}
            />
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения отмены пункта заявки */}
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg max-w-sm w-full p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Підтвердження скасування</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ви впевнені, що хочете скасувати цей пункт заявки? Цю дію неможливо скасувати.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeCancelModal}
                className="flex-1 py-2 px-4 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80"
              >
                Скасувати
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2 px-4 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления заявки */}
      {deleteOrderModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg max-w-sm w-full p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Підтвердження видалення заявки</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ви впевнені, що хочете видалити цю заявку? Цю дію неможливо скасувати.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteOrderModal}
                className="flex-1 py-2 px-4 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80"
              >
                Скасувати
              </button>
              <button
                onClick={handleDeleteOrder}
                className="flex-1 py-2 px-4 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;