import { PrismaClient, User } from '@prisma/client';
import { Telegraf } from 'telegraf';

import { BOT_TOKEN } from './env';

const prisma = new PrismaClient();
const bot = new Telegraf(BOT_TOKEN);

const userSessionMap: Map<number, UserSessionState> = new Map();

enum BotCommand {
  GetAddress = 'getaddress',
  SetAddress = 'setaddress',
}

enum UserSessionState {
  Default = 'Default',
  SettingAddress = 'SettingAddress',
}

bot.start(async (ctx) => {
  await prisma.user.upsert({
    where: { id: ctx.from.id },
    create: ctx.from,
    update: ctx.from,
  });

  ctx.reply('Добро пожаловать!');
});

bot.help((ctx) => ctx.reply('Укажите адрес, передавайте показания по запросу бота.'));

bot.command(BotCommand.SetAddress, async (ctx) => {
  userSessionMap.set(ctx.from.id, UserSessionState.SettingAddress);

  await ctx.reply('Введите адрес');
});

bot.command(BotCommand.GetAddress, async (ctx) => {
  const user = await prisma.user.findUnique({ where: { id: ctx.from.id } });

  if (user?.address) {
    await ctx.reply(`Ваш адрес: ${user.address}`);
  } else {
    await ctx.reply('Вы ещё не указали адрес');
  }
});

bot.on('text', async (ctx) => {
  console.log(ctx.message.text);

  const userSessionState = userSessionMap.get(ctx.chat.id);

  if (userSessionState === UserSessionState.SettingAddress) {
    const user: User = {
      id: ctx.from.id,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name ?? null,
      username: ctx.from.username ?? null,
      address: ctx.message.text,
    };

    await prisma.user.upsert({
      where: { id: ctx.from.id },
      create: user,
      update: user,
    });

    userSessionMap.set(ctx.from.id, UserSessionState.Default);

    await ctx.reply('Ваш адрес сохранен');
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
