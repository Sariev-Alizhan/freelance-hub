import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.EMAIL_FROM ?? 'FreelanceHub <noreply@freelancehub.ru>'
const BASE_URL = 'https://freelance-hub-gamma.vercel.app'

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log('[email] RESEND_API_KEY not set — skip email to', to)
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (e) {
    console.error('[email] send failed:', e)
  }
}

// ── Templates ────────────────────────────────────────────────

function base(content: string) {
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#E6EDF3}
  .wrap{max-width:580px;margin:40px auto;background:#161B27;border-radius:16px;border:1px solid #30363D;overflow:hidden}
  .head{background:linear-gradient(135deg,#4F46E5,#6D28D9);padding:32px 32px 28px;text-align:center}
  .head-logo{font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px}
  .head-logo span{opacity:0.7}
  .body{padding:32px}
  .title{font-size:20px;font-weight:700;margin:0 0 8px;color:#E6EDF3}
  .sub{font-size:15px;color:#8B949E;margin:0 0 24px;line-height:1.5}
  .card{background:#0D1117;border:1px solid #30363D;border-radius:12px;padding:20px;margin:20px 0}
  .card-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#8B949E;margin-bottom:6px}
  .card-value{font-size:15px;color:#E6EDF3;font-weight:500;margin:0}
  .btn{display:inline-block;margin-top:8px;padding:14px 28px;background:#4338CA;color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600}
  .footer{padding:20px 32px;border-top:1px solid #30363D;font-size:12px;color:#484F58;text-align:center}
  a{color:#818CF8}
</style></head><body>
<div class="wrap">
  <div class="head"><div class="head-logo">Freelance<span>Hub</span></div></div>
  <div class="body">${content}</div>
  <div class="footer">© 2025 FreelanceHub &mdash; фриланс-платформа для СНГ<br>
  <a href="${BASE_URL}/dashboard">Управление уведомлениями</a></div>
</div></body></html>`
}

export function emailNewResponse({ orderTitle, freelancerName, orderId }: {
  orderTitle: string; freelancerName: string; orderId: string
}) {
  return base(`
    <p class="title">Новый отклик на заказ</p>
    <p class="sub">На ваш заказ откликнулся специалист — проверьте и свяжитесь с ним.</p>
    <div class="card">
      <div class="card-label">Заказ</div>
      <p class="card-value">${orderTitle}</p>
    </div>
    <div class="card">
      <div class="card-label">Откликнулся</div>
      <p class="card-value">${freelancerName}</p>
    </div>
    <a class="btn" href="${BASE_URL}/orders/${orderId}">Посмотреть отклик</a>
  `)
}

export function emailNewReview({ reviewerName, rating, text, freelancerId }: {
  reviewerName: string; rating: number; text: string; freelancerId: string
}) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  return base(`
    <p class="title">Вы получили новый отзыв</p>
    <p class="sub">Клиент оценил вашу работу — посмотрите что он написал.</p>
    <div class="card">
      <div class="card-label">От</div>
      <p class="card-value">${reviewerName}</p>
    </div>
    <div class="card">
      <div class="card-label">Оценка</div>
      <p class="card-value" style="color:#FBBF24;font-size:20px">${stars}</p>
    </div>
    <div class="card">
      <div class="card-label">Отзыв</div>
      <p class="card-value">${text}</p>
    </div>
    <a class="btn" href="${BASE_URL}/freelancers/${freelancerId}">Посмотреть профиль</a>
  `)
}

export function emailOrderCreated({ orderTitle, orderId }: {
  orderTitle: string; orderId: string
}) {
  return base(`
    <p class="title">Заказ опубликован!</p>
    <p class="sub">Ваш заказ уже виден специалистам. Первые отклики появятся в течение нескольких часов.</p>
    <div class="card">
      <div class="card-label">Заказ</div>
      <p class="card-value">${orderTitle}</p>
    </div>
    <a class="btn" href="${BASE_URL}/orders/${orderId}">Открыть заказ</a>
  `)
}
