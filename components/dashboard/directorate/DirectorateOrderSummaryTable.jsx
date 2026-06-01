'use client';

import { useState } from 'react';
import React from 'react';
import { FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { useOrders } from '../../../hooks/useOrdersQuery';

/**
 * DirectorateOrderSummaryTable - Сводная таблица заявок с деревом вложенных пунктов
 * Используется в DirectorateDashboard для быстрого обзора всех заявок
 * 
 * Функционал:
 * - Отображение заявок в табличной форме с возможностью раскрытия
 * - Показывает пункты заявки внутри каждой заявки (дерево)
 * - Цветовая индикация статуса заявки на основе пунктов
 * - Статистика по пунктам заявки
 */

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

const DirectorateOrderSummaryTable = () => {
  const { data: ordersData, isLoading } = useOrders();
  const [expandedOrders, setExpandedOrders] = useState({});
  const orders = ordersData?.orders || [];

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Немає заявок для перегляду</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-foreground w-8"></th>
            <th className="text-left py-3 px-4 font-medium text-foreground">Номер заявки</th>
            <th className="text-left py-3 px-4 font-medium text-foreground">Заявник</th>
            <th className="text-left py-3 px-4 font-medium text-foreground">Дата</th>
            <th className="text-left py-3 px-4 font-medium text-foreground">Пріоритет</th>
            <th className="text-left py-3 px-4 font-medium text-foreground">Статус</th>
            <th className="text-center py-3 px-4 font-medium text-foreground">Пунктів</th>
            <th className="text-left py-3 px-4 font-medium text-foreground">Примітки</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const orderStatus = getOrderStatus(order.products);
            const total = order.products.length;
            const approved = order.products.filter(p => p.status === 'APPROVED' || p.status === 'ORDERED' || p.status === 'PAID' || p.status === 'IN_TRANSIT' || p.status === 'RECEIVED').length;
            const rejected = order.products.filter(p => p.status === 'REJECTED' || p.status === 'CANCELLED').length;
            const pending = order.products.filter(p => p.status === 'PENDING').length;
            const isExpanded = expandedOrders[order.id];

            return (
              <React.Fragment key={order.id}>
                <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleOrder(order.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      disabled={order.products.length === 0}
                    >
                      {order.products.length > 0 ? (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )
                      ) : null}
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
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <span className="text-muted-foreground">{total}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-green-600 dark:text-green-400">{approved}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-red-600 dark:text-red-400">{rejected}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-yellow-600 dark:text-yellow-400">{pending}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      (всього / схвалено / відхилено / очікує)
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                    {order.notes || '-'}
                  </td>
                </tr>
                {isExpanded && order.products.map((product) => (
                  <tr key={product.id} className="border-b border-border bg-muted/30">
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
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[product.status]}`}>
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
                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate text-xs">
                      {product.rejectionReason || '-'}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DirectorateOrderSummaryTable;
