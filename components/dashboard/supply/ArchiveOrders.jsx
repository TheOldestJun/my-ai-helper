'use client';

import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, ShoppingCart, CreditCard, Truck, CircleCheck, X, Archive, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { useArchivedOrders } from '../../../hooks/useApi';

/**
 * ArchiveOrders - Компонент для отображения архивных заявок в виде дерева
 * Используется в SupplyDashboard для просмотра архивных заявок
 *
 * Функционал:
 * - Отображение архивных заявок (не старше 3 лет) в табличной форме с возможностью раскрытия
 * - Показывает пункты заявки внутри каждой заявки (дерево)
 * - Только снабжение может видеть архивные заявки
 * - Отображение информации о заявке и её товарах
 *
 * Хуки TanStack Query:
 * - useArchivedOrders: загрузка архивных заявок
 */

const statusIcons = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  ORDERED: ShoppingCart,
  PAID: CreditCard,
  IN_TRANSIT: Truck,
  RECEIVED: CircleCheck,
  CANCELLED: X,
};

const statusLabels = {
  PENDING: 'Очікує',
  APPROVED: 'Схвалено',
  REJECTED: 'Відхилено',
  ORDERED: 'Замовлено',
  PAID: 'Сплачено',
  IN_TRANSIT: 'В дорозі',
  RECEIVED: 'Отримано',
  CANCELLED: 'Скасовано',
};

const statusColors = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  APPROVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  ORDERED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  PAID: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  IN_TRANSIT: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  RECEIVED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
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

const orderActionLabels = {
  APPROVED: 'Схвалено',
  REJECTED: 'Відхилено',
  ARCHIVED: 'Архівовано',
};

const ArchiveOrders = ({ userId }) => {
  const { data: archivedOrdersData, isLoading, error } = useArchivedOrders(userId);
  const [expandedOrders, setExpandedOrders] = useState({});

  const archivedOrders = archivedOrdersData?.orders || [];

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Определение общего статуса заявки на основе статусов пунктов
  const getOrderStatus = (products) => {
    if (!products || products.length === 0) return 'PENDING';

    const statuses = products.map(p => p.status);

    // Если все пункты отклонены - заявка отклонена
    if (statuses.every(s => s === 'REJECTED' || s === 'CANCELLED')) return 'REJECTED';

    // Если есть отклоненные, но не все - частично отклонена
    if (statuses.some(s => s === 'REJECTED' || s === 'CANCELLED')) return 'PENDING';

    // Если все пункты одобрены или выше - заявка одобрена
    if (statuses.every(s => s === 'APPROVED' || s === 'ORDERED' || s === 'PAID' || s === 'IN_TRANSIT' || s === 'RECEIVED')) {
      return 'APPROVED';
    }

    // Иначе - ожидает
    return 'PENDING';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (archivedOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <Archive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Архівних заявок немає</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Archive className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Архів заявок (не старше 3 років)</h2>
      </div>

      <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-10"></th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">№</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Заявник</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Дата створення</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Пріоритет</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Статус</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Архівовано</th>
              <th className="py-3 px-4 text-center text-xs font-medium text-muted-foreground">Пунктів</th>
            </tr>
          </thead>
          <tbody>
            {archivedOrders.map((order) => {
              const orderStatus = getOrderStatus(order.products);
              const total = order.products.length;
              const approved = order.products.filter(p => p.status === 'APPROVED' || p.status === 'ORDERED' || p.status === 'PAID' || p.status === 'IN_TRANSIT' || p.status === 'RECEIVED').length;
              const rejected = order.products.filter(p => p.status === 'REJECTED' || p.status === 'CANCELLED').length;
              const isExpanded = expandedOrders[order.id];

              return (
                <React.Fragment key={order.id}>
                  <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{order.number}</td>
                    <td className="py-3 px-4 text-foreground">
                      {order.createdBy ? `${order.createdBy.firstName} ${order.createdBy.lastName}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[order.priority]}`}>
                        {priorityLabels[order.priority]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[orderStatus]}`}>
                        {statusLabels[orderStatus]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(order.archivedAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <span className="text-muted-foreground">{total}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-green-600 dark:text-green-400">{approved}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-red-600 dark:text-red-400">{rejected}</span>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <>
                      {order.notes && (
                        <tr className="bg-muted/20">
                          <td colSpan="8" className="py-2 px-4 pl-12 text-xs text-muted-foreground italic">
                            Примітки: {order.notes}
                          </td>
                        </tr>
                      )}

                      {order.history && order.history.length > 0 && (
                        <tr className="bg-muted/20">
                          <td colSpan="8" className="py-2 px-4 pl-12">
                            <div className="text-xs">
                              <p className="font-medium text-muted-foreground mb-1">Історія заявки:</p>
                              <div className="space-y-1">
                                {order.history.map((history) => (
                                  <div key={history.id} className="text-muted-foreground">
                                    {new Date(history.changedAt).toLocaleString('uk-UA')}:{' '}
                                    {orderActionLabels[history.action] || history.action}{' '}
                                    {history.reason && `(${history.reason})`}{' '}
                                    ({history.changedBy?.firstName} {history.changedBy?.lastName})
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {order.products.map((product) => (
                        <React.Fragment key={product.id}>
                          <tr className="bg-muted/10 border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4"></td>
                            <td className="py-3 px-4 pl-8 text-muted-foreground text-xs">└ Пункт</td>
                            <td className="py-3 px-4 text-foreground">
                              <div className="font-medium">{product.product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.quantity} {product.unit.symbol}</div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {product.statusChangedAt ? new Date(product.statusChangedAt).toLocaleDateString('uk-UA') : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[product.status]} flex items-center gap-1`}>
                                {React.createElement(statusIcons[product.status], { className: 'w-3 h-3' })}
                                {statusLabels[product.status]}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {product.statusChangedBy ? (
                                <div className="text-xs text-muted-foreground">
                                  {product.statusChangedBy.firstName} {product.statusChangedBy.lastName}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground max-w-xs truncate text-xs">
                              {product.notes || '-'}
                            </td>
                            <td className="py-3 px-4">
                              {product.statusHistory && product.statusHistory.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {product.statusHistory.length} змін
                                </div>
                              )}
                            </td>
                          </tr>

                          {product.statusHistory && product.statusHistory.length > 0 && (
                            <tr className="bg-muted/5">
                              <td colSpan="8" className="py-2 px-4 pl-16">
                                <div className="text-xs">
                                  <p className="font-medium text-muted-foreground mb-1">Історія змін:</p>
                                  <div className="space-y-1">
                                    {product.statusHistory.map((history) => (
                                      <div key={history.id} className="text-muted-foreground">
                                        {new Date(history.changedAt).toLocaleString('uk-UA')}:{' '}
                                        {statusLabels[history.oldStatus]} → {statusLabels[history.newStatus]}{' '}
                                        ({history.changedBy?.firstName} {history.changedBy?.lastName})
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchiveOrders;
