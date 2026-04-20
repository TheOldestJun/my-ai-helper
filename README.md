# AI Helper - Система управления заявками

Система для управления заявками на закупку товаров с ролевым доступом и workflow.

## Технологии

- **Next.js 16** - React фреймворк с App Router
- **TanStack Query** - Кеширование и управление состоянием данных
- **Prisma** - ORM для работы с базой данных
- **MySQL** - База данных
- **TailwindCSS** - Стилизация
- **Sonner** - Уведомления
- **Lucide Icons** - Иконки

## Структура проекта

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Страница дашборда
│   ├── layout.js          # Корневой макет
│   └── Providers.js       # Провайдеры (TanStack Query)
├── components/            # React компоненты
│   ├── dashboard/         # Компоненты дашбордов
│   │   ├── applicant/     # Заявители
│   │   ├── directorate/   # Директорат
│   │   ├── supply/        # Снабжение
│   │   ├── warehouse/     # Склад
│   │   ├── kitchen/       # Кухня
│   │   └── shared/        # Общие компоненты
│   ├── Autocomplete.jsx   # Автозаполнение
│   ├── Header.jsx         # Шапка
│   ├── Footer.jsx         # Подвал
│   └── LoginForm.jsx      # Форма входа
├── hooks/                 # React хуки
│   ├── useApi.js          # Хуки для получения данных
│   └── useMutations.js    # Хуки для мутаций
├── prisma/                # Prisma
│   ├── schema.prisma      # Схема базы данных
│   └── migrations/        # Миграции
└── lib/                   # Вспомогательные файлы
```

## Установка

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd my-ai-helper
```

2. **Установка зависимостей**
```bash
npm install
```

3. **Настройка базы данных MySQL**

Создайте базу данных:
```sql
CREATE DATABASE ai_helper CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Настройка переменных окружения**

Создайте файл `.env` в корне проекта:
```env
DATABASE_URL="mysql://username:password@localhost:3306/ai_helper"
SHADOW_DATABASE_URL="mysql://username:password@localhost:3306/ai_helper_shadow"
```

Замените `username` и `password` на ваши данные.

5. **Применение миграций**
```bash
npx prisma migrate dev
```

6. **Заполнение справочников** (важный порядок: roles -> users -> units)
```bash
node prisma/seed-roles.js
node prisma/seed-users.js
node prisma/seed-units.js
```

7. **Запуск dev сервера**
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Роли пользователей

- **APPLICANT** - Заявители: создают заявки
- **DIRECTOR** - Директорат: одобряют/отклоняют заявки
- **SUPPLY** - Снабжение: заказывают товары
- **WAREHOUSE** - Склад: принимают товары
- **KITCHEN** - Кухня: планируют меню
- **ADMIN** - Администратор: полное управление

## Workflow заявки

1. **PENDING** - Заявка создана, ожидает рассмотрения
2. **APPROVED** - Заявка одобрена директором
3. **REJECTED** - Заявка отклонена

## Workflow пункта заявки

1. **PENDING** - Пункт ожидает рассмотрения
2. **APPROVED** - Пункт одобрен
3. **ORDERED** - Товар заказан
4. **PAID** - Товар оплачен
5. **IN_TRANSIT** - Товар в пути
6. **RECEIVED** - Товар получен (только склад)
7. **CANCELLED** - Пункт отменен

## API Routes

### Заявки
- `GET /api/orders` - Получение заявок
- `POST /api/orders` - Создание заявки
- `PATCH /api/orders/[id]` - Одобрение/отклонение заявки
- `DELETE /api/orders/[id]` - Удаление заявки

### Пункты заявки
- `PATCH /api/orders/[id]/products/[productId]` - Изменение пункта
- `DELETE /api/orders/[id]/products/[productId]` - Удаление пункта

### Специализированные
- `GET /api/orders/approved-products` - Одобренные товары для исполнителей
- `GET /api/orders/warehouse-products` - Товары на складе

### Справочники
- `GET /api/products` - Список товаров
- `POST /api/products` - Создание товара
- `GET /api/units` - Список единиц измерения
- `POST /api/units` - Создание единицы измерения
- `GET /api/dishes` - Список страв
- `POST /api/dishes` - Создание стравы
- `GET /api/users` - Список пользователей
- `POST /api/users` - Создание пользователя

## TanStack Query

Все данные кешируются на 1 минуту (`staleTime: 60 * 1000`).
Оптимистичные обновления включены для всех мутаций - UI обновляется мгновенно.

### Хуки для получения данных (`hooks/useApi.js`)

- `useOrders(userId)` - Заявки пользователя
- `useApprovedProducts()` - Одобренные товары
- `useWarehouseProducts()` - Товары на складе
- `useDishes()` - Стравы
- `useProducts()` - Товары
- `useUnits()` - Единицы измерения
- `useUsers()` - Пользователи

### Хуки для мутаций (`hooks/useMutations.js`)

**Заявки:**
- `useApproveOrder()` - Одобрение заявки
- `useRejectOrder()` - Отклонение заявки
- `useDeleteOrder()` - Удаление заявки
- `useCreateOrder()` - Создание заявки

**Пункты заявки:**
- `useChangeProductStatus()` - Изменение статуса пункта
- `useDeleteOrderProduct()` - Удаление пункта
- `useApproveProduct()` - Одобрение пункта
- `useRejectProduct()` - Отклонение пункта

**Справочники:**
- `useCreateProduct()` - Создание товара
- `useCreateDish()` - Создание стравы
- `useDeleteDish()` - Удаление стравы

## Разработка

### Добавление нового хука

1. Создайте функцию в `hooks/useApi.js` или `hooks/useMutations.js`
2. Добавьте JSDoc комментарий с описанием
3. Используйте в компоненте

### Добавление нового API route

1. Создайте файл в `app/api/`
2. Экспортируйте функции GET, POST, PATCH, DELETE
3. Добавьте JSDoc комментарий с описанием
4. Используйте Prisma для работы с БД

### Изменение базы данных

1. Измените `prisma/schema.prisma`
2. Примените миграцию: `npx prisma migrate dev --name description`
3. При необходимости создайте seed файл

## Полезные команды

```bash
# Dev сервер
npm run dev

# Production сборка
npm run build
npm start

# Prisma
npx prisma studio              # GUI для БД
npx prisma migrate dev        # Применить миграции
npx prisma migrate reset       # Сбросить БД
npx prisma generate           # Сгенерировать client
```

## Лицензия

MIT
