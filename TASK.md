# Task: Code Review — E-commerce Admin Panel

**Проект:** admin-panel (GreenBox, коробочное решение для интернет-магазинов)  
**Дата ревью:** 19.02.2026  
**Код не менялся — только ревью и список задач.**

---

## 1. Что проверялось

- `src/app/globals.css` — токены Tailwind v4, дизайн-система  
- `schema.sql` — структура таблиц, RLS, storage  
- `SUPABASE_SETUP.md` — понятность инструкции  
- `src/app/layout.tsx` — шрифты и темы  
- Дополнительно: `package.json`, Supabase client/server, `page.tsx`, конфиги

---

## 2. Итог по файлам

### 2.1 `src/app/globals.css`

- **Tailwind v4:** `@import "tailwindcss"` и `@theme inline` используются корректно; семантика цветов (background, foreground, primary и т.д.) и `--radius` заданы.
- **Токены:** Primary `#00C853` задан как `142 76% 36%` (HSL без альфа) — ок. В `.dark` primary задан как `142 70% 50%`, в комментарии указан `#00E676` — стоит сверить HSL с макетом, чтобы не было расхождения.
- **Замечание:** В `* { @apply border-border; }` используется токен `border-border`; в `@theme` задан `--color-border`, класс будет работать. Всё согласовано.

### 2.2 `schema.sql`

- **Таблицы:** products, orders, applications, cms_content, promo_codes — структура под MVP логичная; UUID, timestamptz, JSONB для гибких полей, CHECK для status и discount_type — хорошо.
- **Связи:** `orders.user_id` → `auth.users(id)` — ок. Явных связей products ↔ orders нет (состав заказа в JSONB) — для MVP допустимо.
- **RLS:** Включён для всех таблиц. Политики: любой аутентифицированный пользователь получает полный доступ к данным (FOR ALL … auth.role() = 'authenticated'); для админки с одной ролью «все залогиненные = админы» это ок только при контроле доступа к админке (например, через middleware). Рекомендация: позже ввести отдельную сущность «админ» (таблица или флаг) и завязать RLS на неё.
- **Публичное чтение:** products, cms_content, promo_codes — select для всех (true). Нужно для публичного сайта магазина; для одной только админки не обязательно.
- **Orders/Applications:** insert с with check (true) — создание заказов/заявок с сайта разрешено; остальное — по authenticated. Ок.
- **Storage:** бакеты `products`, `content`; политики: чтение для всех, запись только для authenticated — ок.
- **Замечания:** Нет индексов (по category, status, created_at и т.д.) — при росте данных стоит добавить. Нет полей `updated_at` — при необходимости добавить. Нет CHECK для `price >= 0` и для `promo_codes.value` (например, value > 0 и при percent — value <= 100).

### 2.3 `SUPABASE_SETUP.md`

- Инструкция по шагам: регистрация, проект, ключи, SQL-скрипт, уведомления, проверка — понятна.
- В шаге 1 ссылка «[site Supabase](https://supabase.com/)» — текст лучше сделать «сайт Supabase» для единообразия с русским языком.
- В шаге 5 перечислены таблицы, но не указана `promo_codes` — стоит добавить для полноты.

### 2.4 `src/app/layout.tsx`

- Шрифты: Inter и Space Grotesk через `next/font/google` с переменными `--font-inter` и `--font-space-grotesk` — подключены корректно; в `globals.css` они используются в `@theme` как `--font-sans` и `--font-display`.
- Тема: `ThemeProvider` с `attribute="class"`, `defaultTheme="system"`, `enableSystem` — ок; `suppressHydrationWarning` на `<html>` уместен при смене темы.
- `lang="ru"` и классы `antialiased bg-background text-foreground` на body соответствуют дизайн-системе.

---

## 3. Дополнительные замечания по проекту

- **Supabase client/server:** В `client.ts` и `server.ts` используются `process.env.NEXT_PUBLIC_SUPABASE_URL!` и `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` без проверки. При отсутствии переменных приложение может падать с неочевидной ошибкой — желательно проверять и выводить понятное сообщение.
- **server.ts:** Импорт `CookieOptions` не используется — можно удалить.
- **package.json:** Скрипт `"lint": "eslint"` не передаёт аргументы; обычно используют `next lint` (или `eslint .` с конфигом). `@tanstack/react-query` и `class-variance-authority` установлены, но в коде не используются — либо начать использовать, либо убрать из зависимостей.
- **components.json (Shadcn):** Указан `"config": "tailwind.config.ts"`, в проекте Tailwind v4 через PostCSS и `@theme` в `globals.css`, отдельного `tailwind.config.ts` нет — при добавлении компонентов Shadcn возможны вопросы; при необходимости указать актуальный путь к конфигу или оставить только css.
- **page.tsx:** Оставлен дефолтный контент create-next-app (Next.js logo, ссылки на Vercel/Next). Стили частично используют токены (`bg-foreground`, `text-background`), частично жёсткие цвета (`bg-zinc-50`, `dark:bg-black`, `text-black` и т.д.) — для единообразия с дизайн-системой лучше перевести на токены (например, `bg-background`, `text-foreground`).
- **Документация:** В отчёте упоминается `implementation_plan.md` — в репозитории файл отсутствует; либо добавить файл, либо убрать упоминание.
- **Middleware:** Файла `middleware.ts` нет — защита админ-роутов (редирект неавторизованных) пока не реализована; при появлении роутов админки это нужно добавить.
- **Типы БД:** TypeScript-типы для таблиц Supabase не сгенерированы — по мере роста кода полезно сгенерировать типы (например, `supabase gen types typescript`) и использовать в клиентах.
- **.env:** Есть `.env.local` с плейсхолдерами; `.env.example` в репо нет — удобно добавить для разработчиков.

---

## 4. Задачи для копирования (чеклист)

Ниже список задач в формате «что сделать», без правок кода в ревью.

**Критичные / важные**

1. Добавить проверку переменных окружения в `src/utils/supabase/client.ts` и `src/utils/supabase/server.ts`: при отсутствии URL или anon key выбрасывать понятную ошибку (не полагаться только на `!`).
2. В `schema.sql`: добавить индексы для часто запрашиваемых полей (например, products: category, is_active, created_at; orders: status, created_at; applications: status, created_at).
3. В `schema.sql`: при необходимости добавить поля `updated_at` и триггеры обновления; добавить CHECK для `products.price >= 0` и для `promo_codes` (value > 0 и при discount_type = 'percent' — value <= 100).
4. Создать `src/middleware.ts` для защиты админ-роутов: проверка аутентификации, редирект на страницу входа при отсутствии сессии (реализовать после появления роутов админки).
5. В `SUPABASE_SETUP.md`: исправить формулировку ссылки «site Supabase» → «сайт Supabase»; в шаге 5 перечислить все таблицы, включая `promo_codes`.
6. В `package.json`: заменить скрипт lint на вызов `next lint` (и при необходимости добавить `lint:fix`).
7. Удалить неиспользуемый импорт `CookieOptions` из `src/utils/supabase/server.ts`.
8. Либо начать использовать `@tanstack/react-query` и `class-variance-authority`, либо удалить их из `package.json`.
9. При добавлении UI из Shadcn: проверить путь к конфигу Tailwind в `components.json` (при отсутствии `tailwind.config.ts` — скорректировать или положиться на globals.css).
10. Обновить `src/app/page.tsx`: заменить дефолтный контент на заглушку/лендинг админки и перевести стили на токены дизайн-системы (`bg-background`, `text-foreground` и т.д.).
11. Добавить в репозиторий файл `implementation_plan.md` или убрать его упоминание из отчёта о проделанной работе.
12. Создать `.env.example` с переменными `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` (без реальных значений).

**Рекомендации (по возможности)**

13. Сгенерировать TypeScript-типы для Supabase и подключить их в клиентах (`createBrowserClient`/`createServerClient`).
14. В перспективе уточнить RLS: ввести явную сущность «админ» (таблица/роль) и ограничить доступ к данным только ею.
15. Проверить соответствие цвета `.dark` primary (HSL 142 70% 50%) макету (#00E676) и при необходимости поправить в `globals.css`.

---

## 5. Краткая сводка

- **globals.css:** Токены Tailwind v4 и дизайн-система настроены корректно; уточнить тёмный primary при необходимости.
- **schema.sql:** Структура и RLS подходят для MVP; добавить индексы, при необходимости — updated_at и CHECK-ограничения; в перспективе — разграничение по роли админа.
- **SUPABASE_SETUP.md:** Инструкция понятна; мелкие правки текста и списка таблиц.
- **layout.tsx:** Шрифты и темы подключены правильно.

Исправления из раздела 4 можно копировать в трекер задач и выполнять по приоритету без изменения кода в рамках этого ревью.
