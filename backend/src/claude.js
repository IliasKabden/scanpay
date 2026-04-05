const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// OCR чека — читаем изображение и извлекаем данные
async function parseReceipt(base64Image) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          type: 'text',
          text: `Прочитай этот казахстанский чек и верни ТОЛЬКО JSON без markdown:
{
  "store_name": "название магазина",
  "total_amount": число,
  "currency": "KZT",
  "date": "YYYY-MM-DD",
  "category": "food|electronics|clothing|pharmacy|cafe|other",
  "items": [{"name": "товар", "price": число, "quantity": число}]
}
Если не можешь прочитать — верни {"error": "cannot_read"}`
        }
      ],
    }],
  });

  const text = response.content[0].text;
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { error: 'parse_failed', raw: text };
  }
}

// AI матчинг — автономно решает кому продать данные и по какой цене
async function matchAndDecide(companyRequest, availableProfiles) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Ты автономный AI агент маркетплейса данных.

ЗАПРОС КОМПАНИИ:
${JSON.stringify(companyRequest, null, 2)}

ДОСТУПНЫЕ ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ (анонимные):
${JSON.stringify(availableProfiles, null, 2)}

Проанализируй и прими решение автономно. Верни ТОЛЬКО JSON:
{
  "matched_ids": [список id подходящих профилей],
  "price_per_profile_lamports": число (5000000-50000000),
  "total_profiles": число,
  "reasoning": "объяснение решения на русском",
  "confidence": число от 0 до 100,
  "match_quality": "high|medium|low"
}`
    }],
  });

  const text = response.content[0].text;
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { error: 'parse_failed' };
  }
}

module.exports = { parseReceipt, matchAndDecide };
