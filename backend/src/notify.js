const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode })
    });
    return await res.json();
  } catch (e) {
    console.error('Telegram notify error:', e.message);
    return null;
  }
}

// 1. Receipt processed notification
async function notifyReceiptProcessed(telegramId, storeName, amount, earned) {
  const text = `✅ <b>Чек обработан!</b>\n\n🏪 ${storeName}\n💰 Сумма: ${amount.toLocaleString()} ₸\n\n💸 <b>Вы заработали: ~${earned} ₸</b>\n\nДанные сохранены в блокчейне Solana.`;
  return sendTelegramMessage(telegramId, text);
}

// 2. Data sold notification
async function notifyDataSold(telegramId, companyName, amount) {
  const text = `🎉 <b>Ваши данные проданы!</b>\n\n🏢 Покупатель: ${companyName}\n💸 <b>Начислено: +${amount} ₸</b>\n\nСмарт-контракт автоматически перевёл оплату на ваш кошелёк.`;
  return sendTelegramMessage(telegramId, text);
}

// 3. Daily reminder
async function notifyDailyReminder(telegramId) {
  const messages = [
    '📋 Не забудьте отсканировать чеки сегодня! Каждый чек = деньги.',
    '💰 У вас есть чеки за сегодня? Отсканируйте и заработайте!',
    '📱 Совет: скриншот из Kaspi тоже приносит ~30 ₸. Попробуйте!',
    '🎯 Цель дня: отсканировать 3 чека. Это ~150 ₸!',
  ];
  const text = messages[Math.floor(Math.random() * messages.length)];
  return sendTelegramMessage(telegramId, text);
}

module.exports = { sendTelegramMessage, notifyReceiptProcessed, notifyDataSold, notifyDailyReminder };
