'use client';

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Провайдер для TanStack Query
 * Обеспечивает кеширование и управление состоянием данных во всем приложении
 * 
 * Настройки:
 * - staleTime: 1 минута - данные считаются свежими в течение 1 минуты
 * - refetchOnWindowFocus: false - данные не обновляются при фокусе на окно
 * 
 * Важно: QueryClient создается один раз на клиенте для сохранения кеша
 * при навигации между страницами
 */

// Глобальный QueryClient для браузера (сохраняется между рендерами)
let browserQueryClient = undefined;

/**
 * Создает новый экземпляр QueryClient с настройками по умолчанию
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute - данные кешируются на 1 минуту
        refetchOnWindowFocus: false, // Не обновлять при переключении вкладок
      },
    },
  });
}

/**
 * Возвращает QueryClient для текущей среды (сервер или браузер)
 * На сервере всегда создается новый клиент (для каждого запроса)
 * В браузере используется один общий клиент (для сохранения кеша)
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: всегда создаем новый клиент для каждого запроса
    return makeQueryClient();
  } else {
    // Browser: используем один клиент между рендерами для сохранения кеша
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Главный компонент-провайдер для TanStack Query
 * Оборачивает все приложение и предоставляет доступ к QueryClient
 * 
 * @param {React.ReactNode} children - Дочерние компоненты приложения
 */
export default function Providers({ children }) {
  // Получаем или создаем QueryClient
  const queryClient = getQueryClient();

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}
