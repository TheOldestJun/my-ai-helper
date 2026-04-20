'use client';

import React from 'react';
import { Clock, CheckCircle, XCircle, ShoppingCart, CreditCard, Truck, CircleCheck, X, Archive } from 'lucide-react';
import { toast } from 'sonner';

import { useArchivedOrders } from '../../../hooks/useApi';

/**
 * ArchiveOrders - Компонент для отображения архивных заявок
 * Используется в SupplyDashboard для просмотра архивных заявок
 * 
 * Функционал:
 * - Отображение архивных заявок (не старше 3 лет)
 * - Только снабжение может видеть архивные заявки
 * - Группировка товаров по номеру заявки
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

const ArchiveOrders = ({ userId }) => {
  const { data: archivedOrdersData, isLoading, error } = useArchivedOrders(userId);

  const archivedOrders = archivedOrdersData?.orders || [];

  // Преобразование данных для отображения
  const ordersArray = archivedOrders.map((order) => ({
    orderId: order.id,
    orderNumber: order.number,
    orderPriority: order.priority,
    orderCreatedAt: order.createdAt,
    orderNotes: order.notes,
    archivedAt: order.archivedAt,
    createdBy: order.createdBy,
    products: order.products.map((product) => ({
      id: product.id,
      productName: product.product.name,
      quantity: product.quantity,
      unitName: product.unit.name,
      unitSymbol: product.unit.symbol,
      status: product.status,
      notes: product.notes,
    })),
  }));

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
      
      {ordersArray.map((order) => (
        <div key={order.orderNumber} className="bg-card text-card-foreground p-4 rounded-lg border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="font-semibold text-foreground">№ {order.orderNumber}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[order.orderPriority]}`}>
              {priorityLabels[order.orderPriority]}
            </span>
            <span className="text-sm text-muted-foreground">
              {new Date(order.orderCreatedAt).toLocaleDateString('uk-UA')}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              Архівовано: {new Date(order.archivedAt).toLocaleDateString('uk-UA')}
            </span>
          </div>

          {order.orderNotes && (
            <p className="text-sm text-muted-foreground mb-3">{order.orderNotes}</p>
          )}

          <div className="border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Товари:</p>
            <ul className="space-y-2">
              {order.products.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.productName}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{item.quantity} {item.unitSymbol}</span>
                    {item.notes && (
                      <span className="text-xs text-muted-foreground italic font-medium">({item.notes})</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[item.status]} flex items-center gap-1`}>
                    {React.createElement(statusIcons[item.status], { className: 'w-3 h-3' })}
                    {statusLabels[item.status]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArchiveOrders;
