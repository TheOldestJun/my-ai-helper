<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:workflow -->
# Workflow

- Для разработки: `npm run dev` (без `--webpack`)
- Не запускать `npm run build` для проверки — только для продакшена
- Dev-сервер запускать через detached node process (из-за ограничений окружения)
<!-- END:workflow -->
