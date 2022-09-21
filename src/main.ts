import { PrismaClient, StringAddress } from '@prisma/client';
import { Telegraf } from 'telegraf';

import { BOT_TOKEN } from './env';

const prisma = new PrismaClient();
const bot = new Telegraf(BOT_TOKEN);

const shouldSetAddress: Set<number> = new Set();

enum BotCommand {
  GetAddress = 'getaddress',
  SetAddress = 'setaddress',
}

bot.start(async (ctx) => {
  await prisma.user.create({ data: ctx.from });

  ctx.reply('Добро пожаловать!');
});

bot.help((ctx) => ctx.reply('Укажите адрес, передавайте показания по запросу бота.'));

bot.command(BotCommand.SetAddress, (ctx) => {
  shouldSetAddress.add(ctx.chat.id);
  ctx.reply('Введите адрес');
});

bot.command(BotCommand.GetAddress, async (ctx) => {
  const address = await prisma.stringAddress.findUnique({ where: { userId: ctx.from.id } });

  if (address) {
    ctx.reply(`Ваш адрес: ${address.value}`);
  } else {
    ctx.reply('Вы ещё не указали адрес');
  }
});

bot.on('text', async (ctx) => {
  console.log(ctx.message.text);

  if (shouldSetAddress.has(ctx.chat.id)) {
    shouldSetAddress.delete(ctx.chat.id);

    const userId = ctx.from.id;
    const addressRecord: StringAddress = { userId, value: ctx.message.text };

    await prisma.stringAddress.upsert({
      where: { userId },
      create: addressRecord,
      update: addressRecord,
    });

    ctx.reply('Адрес сохранен');
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', async () => {
  bot.stop('SIGINT');
  await prisma.$disconnect();
});

process.once('SIGTERM', async () => {
  bot.stop('SIGTERM');
  await prisma.$disconnect();
});
