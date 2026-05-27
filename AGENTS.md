<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:workflow -->
# Workflow

- Для разработки: `npm run dev`
- Не запускать `npm run build` для проверки — только для продакшена
- Dev-сервер запускать через detached node process (из-за ограничений окружения)
<!-- END:workflow -->

<!-- BEGIN:setup -->
# Setup (для нового компьютера)

```bash
git clone <repo> my-ai-helper
cd my-ai-helper
cp .env.example .env    # отредактировать DATABASE_URL
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

# База данных

- **MySQL** через Prisma ORM
- Схема: `prisma/schema.prisma`
- Сиды: `prisma/seed.js` (пользователи), `prisma/seed-dishes.js` (блюда для кухни)
- Миграции: `npx prisma migrate dev` (создать и применить)

# Архитектура проекта

```
app/
  api/          — API routes (Next.js Route Handlers)
  help/         — страница помощи
  dashboard/    — (если есть роут дашборда)
components/
  dashboard/
    kitchen/    — кухня: MenuPlanner, MilkTracker, KitchenCalculations
    supply/     — снабжение: заявки, перепустки
    warehouse/  — склад
    directorate/— директорат
    applicant/  — заявник
    shared/     — общие компоненты (OrderCreationForm, OrderList, etc.)
  Autocomplete.jsx  — кастомный автокомплит с созданием на лету
  DatePicker.jsx    — обёртка react-datepicker (локализация uk, dd.MM.yyyy)
  Header.jsx        — шапка с логотипом, меню, ThemeToggle
  LoginForm.jsx     — форма входа
hooks/
  useApi.js         — хуки TanStack Query для GET-запросов
  useMutations.js   — хуки TanStack Query для POST/PATCH/DELETE
prisma/
  schema.prisma     — схема БД
  seed.js           — сид пользователей
  seed-dishes.js    — сид блюд для кухни (70 шт с ценами)
```

# Ключевые особенности

- **Локализация**: украинский язык интерфейса
- **Даты**: компонент DatePicker (react-datepicker + uk locale, формат dd.MM.yyyy)
- **localStorage**: меню на неделю и выбранные дни сохраняются в браузере
- **Таблицы кухни**: дни недели строятся от startDate по календарю, а не фиксированным Пн-Пт
<!-- END:setup -->
