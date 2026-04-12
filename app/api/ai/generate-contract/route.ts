import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Ты — юридический ассистент, специализирующийся на договорах гражданско-правового характера (ГПХ) для фриланс-рынка СНГ.
Сгенерируй полный профессиональный договор на оказание услуг/выполнение работ.

Структура договора:
1. Заголовок (город, дата)
2. Стороны договора
3. Предмет договора
4. Права и обязанности Заказчика
5. Права и обязанности Исполнителя
6. Сроки выполнения работ
7. Стоимость и порядок оплаты
8. Права на результат интеллектуальной деятельности
9. Конфиденциальность
10. Ответственность сторон
11. Форс-мажор
12. Порядок разрешения споров
13. Заключительные положения
14. Реквизиты и подписи сторон

Требования:
- Юридически грамотный язык
- Защищает интересы обеих сторон
- Чёткие формулировки без двусмысленности
- Соответствует законодательству РФ/РК/РБ
- Используй конкретные данные из запроса
- Пиши дату как: г. [город], «__» __________ 202__ г.
- В реквизитах оставь поля для заполнения: ____________
Отвечай только текстом договора, без пояснений до и после.`

export async function POST(request: Request) {
  const {
    clientName,
    freelancerName,
    workDescription,
    deadline,
    amount,
    paymentOrder,
    ipRights,
    city = 'Москва',
  } = await request.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    const mock = getMockContract({ clientName, freelancerName, workDescription, deadline, amount, paymentOrder, ipRights, city })
    return new Response(mock, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  const userPrompt = `Составь договор со следующими параметрами:
Город: ${city}
Заказчик: ${clientName || 'ИП Иванов Иван Иванович'}
Исполнитель: ${freelancerName || 'Петров Пётр Петрович'}
Описание работ: ${workDescription}
Срок выполнения: ${deadline}
Стоимость: ${Number(amount).toLocaleString('ru-RU')} ₽
Порядок оплаты: ${paymentOrder}
Права на результат: ${ipRights}`

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

function getMockContract(p: {
  clientName: string; freelancerName: string; workDescription: string
  deadline: string; amount: string; paymentOrder: string; ipRights: string; city: string
}) {
  return `ДОГОВОР НА ОКАЗАНИЕ УСЛУГ № ___

г. ${p.city}, «__» __________ 202__ г.

СТОРОНЫ

Заказчик: ${p.clientName || 'ИП Иванов Иван Иванович'}, именуемый в дальнейшем «Заказчик», с одной стороны,
и
Исполнитель: ${p.freelancerName || 'Петров Пётр Петрович'}, именуемый в дальнейшем «Исполнитель», с другой стороны,
совместно именуемые «Стороны», заключили настоящий договор о нижеследующем:

1. ПРЕДМЕТ ДОГОВОРА

1.1. Исполнитель обязуется выполнить следующие работы (услуги):
${p.workDescription}

1.2. Результат работ передаётся Заказчику в согласованном формате.

2. СРОКИ

2.1. Срок выполнения работ: ${p.deadline}.
2.2. Срок может быть изменён по письменному соглашению сторон.

3. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ

3.1. Вознаграждение Исполнителя составляет ${Number(p.amount).toLocaleString('ru-RU')} (${p.amount} рублей 00 копеек).
3.2. Порядок оплаты: ${p.paymentOrder}.
3.3. Оплата производится на реквизиты Исполнителя, указанные в разделе 8.

4. ПРАВА НА РЕЗУЛЬТАТ

4.1. ${p.ipRights}.

5. КОНФИДЕНЦИАЛЬНОСТЬ

5.1. Стороны обязуются не разглашать сведения, полученные в ходе исполнения настоящего договора, третьим лицам.

6. ОТВЕТСТВЕННОСТЬ СТОРОН

6.1. За нарушение сроков оплаты Заказчик уплачивает пени в размере 0,1% от суммы за каждый день просрочки.
6.2. За нарушение сроков выполнения Исполнитель уплачивает пени в размере 0,1% от суммы за каждый день просрочки.

7. РАЗРЕШЕНИЕ СПОРОВ

7.1. Споры решаются путём переговоров. При недостижении соглашения — в суде по месту нахождения Ответчика.

8. РЕКВИЗИТЫ И ПОДПИСИ

Заказчик:                          Исполнитель:
ФИО: ___________________           ФИО: ___________________
Телефон: _______________           Телефон: _______________
Email: _________________           Email: _________________
Подпись: _______________           Подпись: _______________
Дата: __________________           Дата: __________________`
}
