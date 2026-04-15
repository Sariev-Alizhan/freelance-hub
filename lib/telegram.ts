const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

export type TgButton = { text: string; url?: string; callback_data?: string; web_app?: { url: string } }

/**
 * Send a Telegram message with optional inline keyboard.
 * inlineKeyboard is a 2-D array: rows → buttons.
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  inlineKeyboard?: TgButton[][],
) {
  if (!BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:                  chatId,
      text,
      parse_mode:               'HTML',
      disable_web_page_preview: true,
      ...(inlineKeyboard?.length ? { reply_markup: { inline_keyboard: inlineKeyboard } } : {}),
    }),
  }).catch(() => {})
}

/** Convenience: notify client that a freelancer applied to their order */
export function notifyClientNewResponse(opts: {
  chatId: number | string
  orderTitle: string
  orderId: string
  freelancerName: string
}) {
  return sendTelegramMessage(
    opts.chatId,
    `📩 <b>New application!</b>\n\n` +
    `<b>${opts.freelancerName}</b> applied to your order:\n` +
    `"${opts.orderTitle}"`,
    [[{ text: '👀 View application', url: `${SITE_URL}/orders/${opts.orderId}` }]],
  )
}

/** Convenience: notify freelancer their application was accepted */
export function notifyFreelancerAccepted(opts: {
  chatId: number | string
  orderTitle: string
  orderId: string
}) {
  return sendTelegramMessage(
    opts.chatId,
    `🎉 <b>Application accepted!</b>\n\n` +
    `Your application for <b>"${opts.orderTitle}"</b> was accepted.\n` +
    `Get in touch with the client and start working!`,
    [[{ text: '💬 Open order', url: `${SITE_URL}/orders/${opts.orderId}` }]],
  )
}

/** Convenience: notify freelancer their application was rejected */
export function notifyFreelancerRejected(opts: {
  chatId: number | string
  orderTitle: string
  orderId: string
}) {
  return sendTelegramMessage(
    opts.chatId,
    `ℹ️ Application for <b>"${opts.orderTitle}"</b> was not selected this time.\nKeep going — new orders are added daily! 💪`,
    [[{ text: '🔍 Find new orders', url: `${SITE_URL}/orders` }]],
  )
}

/** Convenience: notify user about a new chat message */
export function notifyNewMessage(opts: {
  chatId: number | string
  senderName: string
  preview: string
  conversationUserId: string
}) {
  const previewText = opts.preview.length > 80 ? opts.preview.slice(0, 80) + '…' : opts.preview
  return sendTelegramMessage(
    opts.chatId,
    `💬 <b>New message from ${opts.senderName}:</b>\n"${previewText}"`,
    [[{ text: '↩️ Reply in FreelanceHub', url: `${SITE_URL}/messages?open=${opts.conversationUserId}` }]],
  )
}
