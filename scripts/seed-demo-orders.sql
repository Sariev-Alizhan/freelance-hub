-- Seed 5 demo clients + 10 demo orders so /orders catalogue feels alive.
-- Idempotent: checks profiles.username before insert.
-- Demo accounts have NO password in auth.users — they cannot log in.

do $$
declare
  uid uuid;
  client_rows text[] := array[
    -- name | username | location | bio
    'Aigerim Mukasheva|aigerim_biz|Алматы|Founder кофейни в центре Алматы. Запускаем доставку, нужны разные исполнители.',
    'Andrei Volkov|andrei_startup|Москва|CTO раннего fintech-стартапа. Ищем команду для MVP и роста.',
    'Olga Petrenko|olga_agency|Киев|Co-founder диджитал-агентства. Постоянно ищем подрядчиков под клиентские проекты.',
    'Bolat Daulet|bolat_ecom|Астана|Запускаю бренд одежды через Instagram + маркетплейсы.',
    'Yana Kim|yana_saas|Ташкент|Solo-founder SaaS для рестораторов. Бюджет ограничен, нужны исполнители на конкретные задачи.'
  ];
  r text;
  p text[];
begin
  foreach r in array client_rows
  loop
    p := string_to_array(r, '|');
    if exists (select 1 from public.profiles where username = p[2]) then
      continue;
    end if;
    uid := gen_random_uuid();
    insert into auth.users (id) values (uid);
    insert into public.profiles (
      id, username, full_name, avatar_url, role, location, bio,
      origin_instance, dual_role, active_mode, payment_methods,
      is_verified, abuse_strikes
    ) values (
      uid, p[2], p[1],
      'https://api.dicebear.com/7.x/initials/svg?seed=' || replace(p[1],' ','%20') || '&backgroundColor=4338CA&textColor=ffffff',
      'client', p[3], p[4],
      'freelance-hub.kz', false, 'client', '[]'::jsonb,
      true, 0
    )
    on conflict (id) do update set
      username     = excluded.username,
      full_name    = excluded.full_name,
      avatar_url   = excluded.avatar_url,
      role         = excluded.role,
      location     = excluded.location,
      bio          = excluded.bio,
      active_mode  = excluded.active_mode,
      is_verified  = excluded.is_verified;
  end loop;
end $$;

do $$
declare
  -- 10 orders: client_username | category | title | description | budget_min | budget_max | budget_type | deadline | skills_csv | urgent | created_offset_days
  order_rows text[] := array[
    'aigerim_biz|ux-ui|Логотип и фирменный стиль для кофейни|Открываем точку в центре Алматы. Нужны логотип, паттерн, шрифты, упаковка стаканов и пакетов. Стиль — минимализм + крафт. Готовый brand book PDF.|80000|180000|fixed|2 недели|Branding,Logo,Adobe Illustrator,Brand Identity|false|2',
    'andrei_startup|dev|MVP fintech-приложения на Next.js|Стартап в early-stage, фундинг есть. Нужен Next.js 16 + Supabase разработчик на 4-6 недель: онбординг + кошелёк + KYC + админка. После MVP — постоянная нагрузка.|800000|1800000|fixed|6 недель|Next.js,Supabase,TypeScript,Stripe,KYC|false|1',
    'olga_agency|smm|SMM-сопровождение клиента-ресторана 3 мес|Нужен SMM-щик на ведение Instagram + TikTok ресторана премиум-сегмента. 12 reels/мес, 20 stories/нед, аналитика, отчёт. Тестовый период 1 месяц.|150000|280000|fixed|1 месяц|Instagram,TikTok,Reels,Restaurant,Content|true|0',
    'bolat_ecom|targeting|Запуск Meta + TikTok рекламы для бренда одежды|Запускаем летнюю коллекцию. Бюджет на тест 200K тенге. Нужен таргетолог на полный цикл: креативы (бриф есть), запуск, оптимизация. KPI — ROAS 3+.|120000|250000|fixed|3 недели|Meta Ads,TikTok Ads,Creative,E-commerce|true|0',
    'yana_saas|copywriting|Лендинг + email-цепочка для SaaS|Нужен копирайтер: переписать главный лендинг (сейчас слабая конверсия) + welcome-цепочка из 5 писем для новых юзеров. Tone of voice — дружеский, без B2B-канцелярита.|60000|140000|fixed|2 недели|Landing,Email,SaaS,Sales Copy|false|3',
    'aigerim_biz|video|Reels-контент для запуска кофейни (10 роликов)|Снимаем меню, бариста, атмосферу. Нужен монтажёр на постпродакшн: 10 вертикалок 30-45 сек, тексты на видео, цветокор, звук. Исходники предоставлю.|70000|150000|fixed|3 недели|Premiere,After Effects,Reels,Color Grading|false|1',
    'andrei_startup|tg-bots|Telegram-бот для записи на демо звонок|Нужен бот: запись на demo по календарю, напоминания за 24/1ч, follow-up через 3 дня, интеграция с Notion CRM. Aiogram + Postgres.|90000|180000|fixed|2 недели|Aiogram,Python,Notion API,Calendar|false|4',
    'olga_agency|ai-ml|AI-чатбот для сайта клиента (юр. услуги)|Нужен инженер: чатбот с RAG по 200 страницам юр. документации клиента. Claude API. Интеграция через виджет на сайт. После сдачи — поддержка по запросу.|400000|900000|fixed|4 недели|Claude API,RAG,LangChain,Python,FastAPI|false|2',
    'bolat_ecom|nocode|Интернет-магазин на Webflow для бренда одежды|Без кода: Webflow + интеграция с Kaspi/Stripe + корзина + страницы товаров. 15-20 артикулов на старте. Дизайн уже есть в Figma.|180000|350000|fixed|3 недели|Webflow,Figma to Webflow,E-commerce,Kaspi|false|5',
    'yana_saas|3d-art|3D-визуализации продукта для лендинга|3D-рендеры мобильного приложения в руке, на столе, на разных устройствах. 6-8 финальных артов в высоком разрешении. Стиль референсы скину.|80000|160000|fixed|2 недели|Blender,3D Render,Product Viz|false|6'
  ];
  r text;
  p text[];
  client_uid uuid;
  skills_arr text[];
begin
  foreach r in array order_rows
  loop
    p := string_to_array(r, '|');
    select id into client_uid from public.profiles where username = p[1];
    if client_uid is null then
      continue;
    end if;
    -- Skip if a same-title order from same client already exists (idempotent).
    if exists (
      select 1 from public.orders
      where client_id = client_uid and title = p[3]
    ) then
      continue;
    end if;
    skills_arr := string_to_array(p[9], ',');
    insert into public.orders (
      client_id, title, description, category,
      budget_min, budget_max, budget_type,
      deadline, skills, status, is_urgent,
      created_at, updated_at
    ) values (
      client_uid, p[3], p[4], p[2],
      p[5]::int, p[6]::int, p[7],
      p[8], skills_arr, 'open', p[10]::boolean,
      now() - (p[11]::int || ' days')::interval,
      now() - (p[11]::int || ' days')::interval
    );
  end loop;
end $$;

select count(*) as total_orders from public.orders;
