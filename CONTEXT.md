# my-ai-helper — Контекст проекта

## Суть проекта
Система управления заявками на закупку товаров (procurement request management). Пользователи создают заявки на закупку, которые проходятPipeline согласования и исполнения: заявитель → директор → снабжение → склад → кухня.

## Tech Stack
- **Next.js 16.2.1** (App Router) — **ВАЖНО:** версия с breaking changes, читать `node_modules/next/dist/docs/`
- **React 19.2.4**, TanStack React Query 5, Tailwind CSS v4
- **Prisma 6** + MySQL (remote: tommy.heliohost.org:3306)
- **bcryptjs**, jsPDF, html2pdf.js, xlsx, Sonner, Lucide, next-themes
- **JavaScript** (JSX), без TypeScript

## Структура проекта
```
my-ai-helper/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout (ThemeProvider, Header, Footer, Toaster)
│   ├── page.js                   # LoginForm
│   ├── Providers.js              # TanStack Query provider
│   ├── dashboard/page.js         # Роутинг по ролям
│   └── api/                      # REST API (login, register, orders, products, units, dishes, users)
├── components/
│   ├── Header.jsx, Footer.jsx, LoginForm.jsx, Autocomplete.jsx
│   ├── ThemeProvider.jsx, ThemeToggle.jsx
│   └── dashboard/
│       ├── admin/                # AdminDashboard, UserManagement
│       ├── applicant/            # ApplicantDashboard
│       ├── directorate/          # DirectorateDashboard, OrderList, OrderSummaryTable
│       ├── supply/               # SupplyDashboard, ArchiveOrders
│       ├── warehouse/            # WarehouseDashboard
│       └── kitchen/              # KitchenDashboard, KitchenCalculations, MenuPlanner, MilkTracker
├── hooks/
│   ├── useApi.js                 # Хуки для получения данных (useOrders, useProducts, etc.)
│   └── useMutations.js           # Хуки для мутаций (useApproveOrder, useCreateOrder, etc.)
├── prisma/
│   ├── schema.prisma             # Схема БД: 7 моделей, 4 enum
│   ├── index.js                  # Prisma client singleton
│   └── migrations/               # 15 миграций
└── lib/robotoFont.js             # Base64 Roboto для PDF
```

## Роли и业务流程
| Роль | Доступ |
|---|---|
| **APPLICANT** | Создание и отслеживание своих заявок |
| **DIRECTOR** | Согласование/отклонение заявок, сводная таблица |
| **SUPPLY** | Просмотр согласованных, закупка, работа с архивом |
| **WAREHOUSE** | Приёмка товаров на склад |
| **KITCHEN** | Планирование меню, расчёт продуктов, трекер молока |
| **ADMIN** | Управление пользователями, ролями |

## Жизненный цикл заявки
Создана → Согласована/Отклонена → Закуплена → Получена (склад)

## Аутентификация
bcryptjs + localStorage (кастомная, не NextAuth.js)

## Команды
- `npm run dev` — разработка
- `npm run build` / `npm start` — продакшн
- `npx prisma studio` — Prisma GUI
- Сиды: `node prisma/seed-roles.js` (и т.д. — по порядку)
