import { Telegraf } from 'telegraf';

import { BOT_TOKEN } from './env';

const bot = new Telegraf(BOT_TOKEN);

const shouldSetAddress: Set<number> = new Set();
const addressMap: Map<number, string> = new Map();

bot.start((ctx) => ctx.reply('Добро пожаловать!\n Введите адрес'));
bot.help((ctx) => ctx.reply('Not implemented'));

bot.command('setaddress', (ctx) => {
  shouldSetAddress.add(ctx.chat.id);
  ctx.reply('Введите адрес');
});

bot.command('getaddress', (ctx) => {
  const address = addressMap.get(ctx.chat.id);
  if (address) {
    ctx.reply(`Ваш адрес: ${address}`);
  } else {
    ctx.reply('Вы ещё не указали адрес');
  }
});

bot.on('text', (ctx) => {
  if (shouldSetAddress.has(ctx.chat.id)) {
    shouldSetAddress.delete(ctx.chat.id);
    console.log(ctx.message.text);
    addressMap.set(ctx.chat.id, ctx.message.text);
    ctx.reply('Адрес сохранен');
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
