-- Launch seed: 10 realistic orders + 6 AI agents.
-- Anti-ghost-town content before going public. Uses the platform's first
-- profile as client/creator — safe because seed rows are clearly labeled
-- and can be purged later with:
--   DELETE FROM orders        WHERE title LIKE '[seed]%';
--   DELETE FROM custom_agents WHERE name  LIKE '[seed]%' OR id::text LIKE 'seed-%';

DO $$
DECLARE
  seed_user uuid;
BEGIN
  SELECT id INTO seed_user FROM profiles ORDER BY created_at ASC LIMIT 1;
  IF seed_user IS NULL THEN
    RAISE EXCEPTION 'No profile found — sign up at least one user before running this seed.';
  END IF;

  -- ───────── Orders ─────────
  INSERT INTO orders (client_id, title, description, category, budget_min, budget_max, budget_type, deadline, skills, is_urgent, status)
  VALUES
    (seed_user, 'Разработка лендинга для школы английского',
     'Нужен одностраничник с формой записи, блоком преподавателей и отзывами. Next.js или готовый конструктор — на ваш выбор. Домен и хостинг есть.',
     'dev', 180000, 350000, 'fixed', (now() + interval '21 days')::date, ARRAY['Next.js','TailwindCSS','Landing'], false, 'open'),

    (seed_user, 'Telegram-бот для автоматизации записи клиентов',
     'Косметологический кабинет в Астане. Нужен бот с календарём записи, напоминаниями за 24ч, интеграцией с Google Calendar админа. MVP за 2 недели.',
     'tg-bots', 100000, 180000, 'fixed', (now() + interval '14 days')::date, ARRAY['Telegram Bot API','Python','Google Calendar'], true, 'open'),

    (seed_user, 'SMM-стратегия и контент-план для IT-стартапа',
     'Запускаем B2B SaaS для HR. Нужна стратегия для LinkedIn + Instagram на 3 месяца, 40+ постов с визуалами. Brand voice — технично-дружелюбный.',
     'smm', 150000, 300000, 'fixed', (now() + interval '30 days')::date, ARRAY['Content Strategy','LinkedIn','Instagram','Copywriting'], false, 'open'),

    (seed_user, 'Логотип и мини-брендбук для кофейни',
     'Открываем кофейню в центре Алматы. Название уже есть — нужен логотип, паттерн, 3 варианта вывески, меню-борд, стикеры. Референсы пришлю.',
     'ux-ui', 60000, 120000, 'fixed', (now() + interval '10 days')::date, ARRAY['Logo Design','Brand Identity','Illustrator'], false, 'open'),

    (seed_user, 'Настройка таргетированной рекламы Instagram + Meta',
     'Детская школа программирования. Бюджет 500k₸/мес. Нужен специалист на старт + первый месяц ведения. KPI — 50 квалиф. лидов.',
     'targeting', 120000, 200000, 'fixed', (now() + interval '7 days')::date, ARRAY['Meta Ads','Instagram','Audience Research'], true, 'open'),

    (seed_user, 'Рекламный ролик 30 сек для YouTube Shorts',
     'Продукт — онлайн-курс подготовки к ЕНТ. Нужен скрипт, раскадровка, монтаж. Съёмка у вас или стоковая графика — обсудим. 2 итерации правок в бюджете.',
     'video', 60000, 120000, 'fixed', (now() + interval '18 days')::date, ARRAY['After Effects','Motion Design','Scriptwriting'], false, 'open'),

    (seed_user, 'Копирайтинг для корпоративного сайта (12 страниц)',
     'Компания в сфере логистики. Нужны тексты на RU/EN для главной, услуг, кейсов, FAQ. Интервью с директором для тона голоса — обеспечим.',
     'copywriting', 80000, 150000, 'fixed', (now() + interval '20 days')::date, ARRAY['Copywriting','B2B','Translation'], false, 'open'),

    (seed_user, 'MVP приложения на Flutter — фитнес-трекер',
     'iOS + Android. Функционал: профиль, каталог тренировок, таймер, статистика, push-напоминания. Дизайн-система уже есть в Figma.',
     'dev', 500000, 900000, 'fixed', (now() + interval '45 days')::date, ARRAY['Flutter','Dart','Firebase','iOS','Android'], false, 'open'),

    (seed_user, 'Chatbot на базе AI для B2B-поддержки',
     'Нужен AI-ассистент первой линии: отвечает на типовые вопросы из базы знаний, эскалирует сложные кейсы в Telegram команде. Интеграция с Intercom приветствуется.',
     'ai-ml', 180000, 320000, 'fixed', (now() + interval '25 days')::date, ARRAY['Claude API','LangChain','Intercom','RAG'], false, 'open'),

    (seed_user, 'Дизайн pitch deck для инвесторского раунда',
     '12 слайдов, seed-стадия, $1M ask. Нужен визуальный разбор чисел + сильная типографика. Текст готов, нужна визуальная драматургия.',
     'ux-ui', 70000, 140000, 'fixed', (now() + interval '7 days')::date, ARRAY['Figma','Keynote','Data Viz','Pitch Design'], true, 'open');

  -- ───────── AI Agents (custom_agents) ─────────
  INSERT INTO custom_agents (creator_id, name, tagline, description, category, skills, system_prompt, model, price_per_task, tasks_completed, is_published)
  VALUES
    (seed_user, 'LandingForge AI',
     'Генерирует посадочные страницы — копирайт, структура, CTA',
     'Дай задание и ICP — LandingForge вернёт готовую структуру лендинга: hero, фичи, соц-пруф, FAQ, CTA. Выход — HTML/Tailwind или документ для разработчика. Под SaaS, физ. товары, услуги.',
     'dev', ARRAY['Copywriting','UX Writing','HTML','Tailwind CSS','Conversion Optimization'],
     'Ты — эксперт по конверсионным лендингам. Спроси у клиента: продукт, ICP, главную боль, оффер, желаемое действие. Верни структуру: hero (заголовок + подзаголовок + CTA), 3-5 блоков фич, соц-пруф, FAQ, финальный CTA. Используй Tailwind utility classes. Тон — короткие конкретные фразы, без воды.',
     'Claude Sonnet 4.6', 35000, 89, true),

    (seed_user, 'SocialPilot AI',
     'Автономный SMM — контент, постинг, аналитика',
     'Загрузи бренд-кит и график — агент сам пишет копирайт, генерит промпты для визуалов, планирует выходы, мониторит вовлечённость. Еженедельный отчёт по метрикам.',
     'smm', ARRAY['Instagram','TikTok','Copywriting','Analytics','Content Calendar'],
     'Ты — SMM-стратег для Instagram и TikTok в СНГ. По бренд-киту составь контент-план на неделю: 7 постов с копирайтом, хештегами, CTA. Для каждого поста — описание визуала (промпт для генератора). Учитывай актуальные тренды и алгоритмы.',
     'Claude Sonnet 4.6', 22000, 142, true),

    (seed_user, 'ContractCraft AI',
     'Фриланс-контракты на RU/EN/KZ под твою юрисдикцию',
     'Опиши объём работы, оплату, дедлайны — агент сгенерит договор между заказчиком и исполнителем. Поддержка Kaspi, USDT-перевода, банковского расчёта. PDF + ссылка на подписание.',
     'copywriting', ARRAY['Legal','Contracts','KZT','USDT','E-signature'],
     'Ты — юридический ассистент по фриланс-контрактам в РФ/КЗ/UA. Собери у пользователя: стороны, объём работ, сроки, сумма, способ оплаты (Kaspi/USDT/банк), условия расторжения. Сгенерируй договор на нужном языке (RU/EN/KZ) с реквизитами в конце.',
     'Claude Sonnet 4.6', 8000, 67, true),

    (seed_user, 'BrandVoice Analyst',
     'Анализирует tone-of-voice конкурентов и строит позиционирование',
     'Дай 3-5 ссылок на сайты и Instagram конкурентов — агент выявит их воис, слабые места в коммуникации и предложит уникальное позиционирование для твоего бренда. Выход — PDF на 8 страниц.',
     'smm', ARRAY['Brand Strategy','Competitor Analysis','Positioning'],
     'Ты — бренд-стратег. По 3-5 ссылкам на конкурентов проведи анализ tone-of-voice (формальность, эмоциональность, образы), коммуникационных слабостей, ценностей. Предложи уникальное позиционирование для бренда клиента: tagline, voice attributes, 3 ключевых сообщения.',
     'Claude Sonnet 4.6', 28000, 34, true),

    (seed_user, 'VideoCutter AI',
     'Нарезает длинное видео на вирусные Shorts с субтитрами',
     'Загрузи YouTube-ссылку или файл до 2 часов — агент найдёт 5-8 вирусных моментов, нарежет вертикально, добавит субтитры на выбранном языке. Готовые .mp4 на выходе.',
     'video', ARRAY['Video Editing','Subtitles','YouTube Shorts','TikTok'],
     'Ты — видеоредактор для коротких форматов. По транскрипту видео найди 5-8 моментов с высоким вирусным потенциалом (резкие повороты, инсайты, эмоции). Для каждого — таймкоды начала/конца (45-60 сек), хук для первой секунды, subtitle стиль, CTA в конце.',
     'Claude Sonnet 4.6', 15000, 91, true),

    (seed_user, 'ResearchScout AI',
     'Глубокий ресёрч рынка за 30 минут вместо 3 дней',
     'Опиши ниш/продукт — агент соберёт размер рынка, топ-10 игроков, цены, сильные-слабые стороны, тренды, регуляторку. Источники — с цитатами и ссылками. 20-30 страниц исследования.',
     'ai-ml', ARRAY['Market Research','Competitive Intelligence','Claude','Web Search'],
     'Ты — market research analyst. По описанию ниши собери: размер рынка (TAM/SAM/SOM), 10 топ-игроков с ценами и USP, 5 ключевых трендов, регуляторные риски, барьеры входа. Каждое утверждение — со ссылкой на источник. Финальный summary — ключевые инсайты для go-to-market.',
     'Claude Opus 4.7', 55000, 23, true);

END $$;
