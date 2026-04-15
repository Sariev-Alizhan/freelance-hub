import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage } from '@/lib/telegram'

const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID || ''

function isAdmin(chatId: number | string) {
  return ADMIN_CHAT_ID && String(chatId) === String(ADMIN_CHAT_ID)
}

// POST /api/telegram/webhook
export async function POST(req: Request) {
  try {
    const body    = await req.json()
    const message = body?.message
    if (!message) return Response.json({ ok: true })

    const chatId = message.chat?.id
    const text   = (message.text || '').trim()
    if (!chatId) return Response.json({ ok: true })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any

    // ── /start CODE — link account ────────────────────────────────────────────
    if (text.startsWith('/start ')) {
      const code = text.slice(7).trim()

      const LINK_TTL_MS = 24 * 60 * 60 * 1000
      const embeddedTs  = parseInt(code.slice(8), 36)
      const codeExpired = !isNaN(embeddedTs) && (Date.now() - embeddedTs) > LINK_TTL_MS

      if (codeExpired) {
        await sendTelegramMessage(chatId,
          '⏰ <b>Ссылка устарела.</b>\n\nСгенерируй новую в личном кабинете FreelanceHub.',
          [[{ text: '🔑 Личный кабинет', url: `${SITE_URL}/dashboard` }]],
        )
        return Response.json({ ok: true })
      }

      const { data: profile } = await db
        .from('profiles')
        .select('id, full_name')
        .eq('telegram_link_code', code)
        .maybeSingle()

      if (profile) {
        await db
          .from('profiles')
          .update({ telegram_chat_id: chatId, telegram_link_code: null })
          .eq('id', profile.id)

        const name = profile.full_name || 'друг'
        await sendTelegramMessage(
          chatId,
          `✅ <b>Подключено!</b>\n\nПривет, <b>${name}</b>! Твой аккаунт FreelanceHub теперь связан с Telegram.\n\nБудешь получать уведомления:\n• 📩 Новые отклики на твои заказы\n• 🎉 Принята заявка\n• 🔔 Новые заказы в твоей категории\n• ⭐ Новые отзывы`,
          [[{ text: '🏠 Открыть FreelanceHub', url: SITE_URL }]],
        )
      } else {
        await sendTelegramMessage(chatId,
          '❌ <b>Неверная или устаревшая ссылка.</b>\n\nСгенерируй новую в личном кабинете.',
          [[{ text: '🔑 Личный кабинет', url: `${SITE_URL}/dashboard` }]],
        )
      }
      return Response.json({ ok: true })
    }

    // ── /start — welcome ──────────────────────────────────────────────────────
    if (text === '/start') {
      const greeting = isAdmin(chatId)
        ? `👑 <b>Zhanmate, добро пожаловать!</b>\n\nЭто твой FreelanceHub — командный центр.\n\nКоманды:\n/help — помощь\n/status — статус\n/orders — заказы\n/stats — статистика платформы`
        : `👋 <b>Добро пожаловать в FreelanceHub!</b>\n\nЯ уведомляю тебя о заказах, откликах и отзывах в реальном времени.\n\nПодключи аккаунт из личного кабинета чтобы начать.`

      // Set admin's chat menu button to NEXUS Mini App
      if (isAdmin(chatId)) {
        const tgToken = process.env.TELEGRAM_BOT_TOKEN
        if (tgToken) {
          fetch(`https://api.telegram.org/bot${tgToken}/setChatMenuButton`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              menu_button: {
                type: 'web_app',
                text: '⚡ NEXUS',
                web_app: { url: `${SITE_URL}/admin/nexus` },
              },
            }),
          }).catch(() => {})
        }
      }

      await sendTelegramMessage(chatId, greeting, isAdmin(chatId)
        ? [
            [{ text: '⚡ NEXUS Mission Control', web_app: { url: `${SITE_URL}/admin/nexus` } }],
            [{ text: '📊 Админ панель', url: `${SITE_URL}/admin` }],
          ]
        : [
            [{ text: '🔑 Подключить аккаунт', url: `${SITE_URL}/dashboard` }],
            [{ text: '🌐 Открыть FreelanceHub', url: SITE_URL }],
          ]
      )
      return Response.json({ ok: true })
    }

    // ── /help ─────────────────────────────────────────────────────────────────
    if (text === '/help') {
      const adminExtra = isAdmin(chatId)
        ? '\n\n👑 <b>Команды администратора:</b>\n/stats — статистика платформы\n/nexus — открыть NEXUS'
        : ''

      await sendTelegramMessage(chatId,
        '📖 <b>FreelanceHub Bot — Команды</b>\n\n' +
        '/start — приветствие\n' +
        '/help — эта справка\n' +
        '/status — проверить подключение аккаунта\n' +
        '/orders — последние открытые заказы' +
        adminExtra +
        '\n\n<i>Уведомления приходят автоматически при новых откликах, принятых заявках, отзывах и новых заказах в твоей категории.</i>',
      )
      return Response.json({ ok: true })
    }

    // ── /status ───────────────────────────────────────────────────────────────
    if (text === '/status') {
      if (isAdmin(chatId)) {
        // Admin gets platform stats
        const [{ count: usersCount }, { count: ordersCount }] = await Promise.all([
          db.from('profiles').select('*', { count: 'exact', head: true }),
          db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        ])
        await sendTelegramMessage(chatId,
          `👑 <b>Zhanmate — CEO FreelanceHub</b>\n\n` +
          `👥 Пользователей: <b>${usersCount ?? '—'}</b>\n` +
          `📋 Открытых заказов: <b>${ordersCount ?? '—'}</b>\n\n` +
          `Платформа работает в штатном режиме ✅`,
          [
            [{ text: '⚡ NEXUS', web_app: { url: `${SITE_URL}/admin/nexus` } }],
            [{ text: '📊 Панель', url: `${SITE_URL}/admin` }],
          ],
        )
        return Response.json({ ok: true })
      }

      const { data: linked } = await db
        .from('profiles')
        .select('full_name, username')
        .eq('telegram_chat_id', chatId)
        .maybeSingle()

      if (linked) {
        const name = linked.full_name || linked.username || 'пользователь'
        await sendTelegramMessage(chatId,
          `✅ <b>Подключён как ${name}</b>\n\nТвой Telegram привязан к FreelanceHub. Уведомления активны.`,
          [
            [{ text: '🏠 Личный кабинет', url: `${SITE_URL}/dashboard` }],
            [{ text: '🔍 Заказы', url: `${SITE_URL}/orders` }],
          ],
        )
      } else {
        await sendTelegramMessage(chatId,
          '🔴 <b>Не подключён</b>\n\nТвой Telegram не привязан ни к одному аккаунту FreelanceHub.',
          [[{ text: '🔑 Подключить аккаунт', url: `${SITE_URL}/dashboard` }]],
        )
      }
      return Response.json({ ok: true })
    }

    // ── /stats (admin only) ───────────────────────────────────────────────────
    if (text === '/stats') {
      if (!isAdmin(chatId)) {
        await sendTelegramMessage(chatId, '⛔ Команда доступна только администратору.')
        return Response.json({ ok: true })
      }

      const [
        { count: users },
        { count: openOrders },
        { count: inProgress },
        { count: completed },
        { count: freelancers },
      ] = await Promise.all([
        db.from('profiles').select('*', { count: 'exact', head: true }),
        db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        db.from('freelancer_profiles').select('*', { count: 'exact', head: true }),
      ])

      await sendTelegramMessage(chatId,
        `📊 <b>FreelanceHub — Статистика</b>\n\n` +
        `👥 Пользователей: <b>${users ?? 0}</b>\n` +
        `🧑‍💻 Фрилансеров: <b>${freelancers ?? 0}</b>\n` +
        `📋 Открытых заказов: <b>${openOrders ?? 0}</b>\n` +
        `⚙️ В работе: <b>${inProgress ?? 0}</b>\n` +
        `✅ Завершено: <b>${completed ?? 0}</b>`,
        [[{ text: '📊 Подробнее в панели', url: `${SITE_URL}/admin` }]],
      )
      return Response.json({ ok: true })
    }

    // ── /nexus (admin only) ───────────────────────────────────────────────────
    if (text === '/nexus') {
      if (!isAdmin(chatId)) {
        await sendTelegramMessage(chatId, '⛔ Команда доступна только администратору.')
        return Response.json({ ok: true })
      }
      // Ensure menu button is set
      const tgToken = process.env.TELEGRAM_BOT_TOKEN
      if (tgToken) {
        fetch(`https://api.telegram.org/bot${tgToken}/setChatMenuButton`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            menu_button: { type: 'web_app', text: '⚡ NEXUS', web_app: { url: `${SITE_URL}/admin/nexus` } },
          }),
        }).catch(() => {})
      }
      await sendTelegramMessage(chatId,
        '⚡ <b>NEXUS Mission Control</b>\n\nПринимай предложения от AI-отделов и отправляй в разработку.\n\n<i>Кнопка меню бота настроена — нажми кнопку снизу чтобы открыть NEXUS как мини-приложение.</i>',
        [[{ text: '⚡ Открыть NEXUS', web_app: { url: `${SITE_URL}/admin/nexus` } }]],
      )
      return Response.json({ ok: true })
    }

    // ── /orders — recent open orders ──────────────────────────────────────────
    if (text === '/orders' || text.startsWith('/orders ')) {
      const { data: orders } = await db
        .from('orders')
        .select('id, title, budget_min, budget_max, category')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!orders || orders.length === 0) {
        await sendTelegramMessage(chatId, '📭 Нет открытых заказов прямо сейчас. Заходи позже!',
          [[{ text: '🔍 Все заказы', url: `${SITE_URL}/orders` }]],
        )
        return Response.json({ ok: true })
      }

      const list = orders.map((o: {
        id: string; title: string; budget_min: number; budget_max: number
      }, i: number) => {
        const budget = o.budget_max > 0
          ? `${Number(o.budget_min).toLocaleString('ru-RU')}–${Number(o.budget_max).toLocaleString('ru-RU')} ₸`
          : 'По договорённости'
        return `${i + 1}. <b>${o.title}</b> — ${budget}`
      }).join('\n')

      await sendTelegramMessage(chatId,
        `🔔 <b>Последние открытые заказы:</b>\n\n${list}`,
        [[{ text: '🌐 Все заказы', url: `${SITE_URL}/orders` }]],
      )
      return Response.json({ ok: true })
    }

    // ── Любое другое сообщение ────────────────────────────────────────────────
    const hint = isAdmin(chatId)
      ? '👑 Zhanmate, используй /help для списка команд или открой панель управления.'
      : '💡 Используй /help для списка команд или зайди на FreelanceHub.'

    await sendTelegramMessage(chatId, hint,
      [[{ text: '🌐 Открыть FreelanceHub', url: SITE_URL }]],
    )
  } catch (e) {
    console.error('[telegram/webhook]', e)
  }

  return Response.json({ ok: true })
}
