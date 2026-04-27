-- Seed 10 demo freelancers (one per category) so the /freelancers catalogue
-- looks alive for first-time visitors.
-- All accounts are flagged demo via email suffix @demo.freelance-hub.kz and
-- have no real password — they can't log in.
do $$
declare
  uid uuid;
  rows text[] := array[
    'Aizhan Bekova|aizhan_dev|Алматы|dev|Full-stack Next.js разработчик|senior|Делаю SaaS под ключ — от MVP до продакшена. 6 лет в Next.js + Supabase.|Next.js,React,TypeScript,Supabase,Tailwind,Stripe|18000|45000|4.9|34|41|< 1 hour|true|true',
    'Daniyar Akhmetov|daniyar_ux|Астана|ux-ui|UX/UI дизайнер продуктов|middle|Проектирую интерфейсы SaaS и финтеха. Figma, прототипы, дизайн-системы.|Figma,Webflow,Framer,Prototyping,Design Systems|12000|28000|4.8|22|29|2 hours|true|true',
    'Marina Kovalenko|marina_smm|Киев|smm|SMM-стратег и контентщик|middle|Веду Instagram + TikTok бренды от 10K до 1M подписчиков. Системно, без вирусов.|Instagram,TikTok,Reels,Content Strategy,Analytics|8000|22000|4.7|45|58|3 hours|false|true',
    'Pavel Gorbachev|pavel_ads|Москва|targeting|Performance-маркетолог|senior|Запускаю Meta + Google Ads с ROAS 3-5x. Работал с e-commerce, edtech, SaaS.|Meta Ads,Google Ads,TikTok Ads,Analytics,GTM|15000|38000|4.9|31|44|< 1 hour|true|true',
    'Yelena Sidorova|yelena_copy|Минск|copywriting|Копирайтер B2B SaaS|middle|Лендинги, email-цепочки, лидмагниты. Пишу так, чтобы конвертило, а не нравилось.|Landing Pages,Email,SEO,Content,Sales Copy|6000|18000|4.8|28|39|within a day|false|true',
    'Timur Iskakov|timur_video|Алматы|video|Видеомонтажер Reels & Shorts|middle|Монтирую короткие вертикалки для брендов и блогеров. Premiere + After Effects.|Premiere Pro,After Effects,DaVinci,Reels,Shorts|7000|20000|4.7|52|68|2 hours|false|true',
    'Roman Kovalev|roman_bots|Тбилиси|tg-bots|Telegram-боты под ключ|middle|Aiogram + Python + Postgres. Боты для записи, оплат, рассылок, мини-приложения.|Aiogram,Python,Postgres,Web Apps,Payments|10000|25000|4.8|19|24|3 hours|false|true',
    'Dmitry Volkov|dmitry_ai|Москва|ai-ml|AI / ML-инженер|senior|LLM-приложения, RAG, агенты. Claude API, LangChain, vector DB. Прод-опыт.|Claude API,LangChain,RAG,Vector DB,Python,FastAPI|22000|55000|4.9|26|31|< 1 hour|true|true',
    'Aliya Tursunova|aliya_nc|Ташкент|nocode|No-code разработчик|junior|Bubble, Webflow, Make. Запускаю MVP за 1-2 недели — без программистов.|Bubble,Webflow,Make,Airtable,Zapier|5000|15000|4.6|14|18|within a day|false|false',
    'Sasha Petrov|sasha_3d|СПб|3d-art|3D + AI-художник|middle|Blender + Midjourney. Иллюстрации, концепт-арт, 3D-визуализации продуктов.|Blender,Midjourney,Cinema 4D,Substance,Concept Art|9000|24000|4.7|17|22|2 hours|false|true'
  ];
  r text;
  p text[];
  skills_arr text[];
  premium_until_val timestamptz;
begin
  foreach r in array rows
  loop
    p := string_to_array(r, '|');
    -- Skip if username already exists (idempotent re-runs)
    if exists (select 1 from public.profiles where username = p[2]) then
      continue;
    end if;
    skills_arr := string_to_array(p[8], ',');
    uid := gen_random_uuid();
    -- 1) auth.users — minimal record (no password set, can't log in)
    insert into auth.users (id) values (uid);
    -- 2) profiles — auth.users insert trigger may auto-create a row, so upsert.
    insert into public.profiles (
      id, username, full_name, avatar_url, role, location, bio,
      origin_instance, dual_role, active_mode, payment_methods,
      is_verified, abuse_strikes
    ) values (
      uid, p[2], p[1],
      'https://api.dicebear.com/7.x/initials/svg?seed=' || replace(p[1],' ','%20') || '&backgroundColor=27a644&textColor=ffffff',
      'freelancer', p[3], p[7],
      'freelance-hub.kz', false, 'freelancer', '[]'::jsonb,
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
    -- 3) freelancer_profiles
    premium_until_val := case when p[16]::boolean then now() + interval '1 year' else null end;
    insert into public.freelancer_profiles (
      user_id, title, category, skills,
      price_from, price_to, level, response_time, languages,
      is_verified, rating, reviews_count, completed_orders,
      availability_status, is_premium, premium_until,
      verification_requested
    ) values (
      uid, p[5], p[4], skills_arr,
      p[9]::int, p[10]::int, p[6], p[14], array['ru','en'],
      p[16]::boolean, p[11]::numeric, p[12]::int, p[13]::int,
      'open', p[16]::boolean, premium_until_val,
      false
    );
  end loop;
end $$;

-- Verify
select count(*) as total_freelancers from public.freelancer_profiles;
