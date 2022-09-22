import { User } from '@prisma/client';
import { Scenes, session, Telegraf } from 'telegraf';

import { BotCommand } from './bot-command';
import { BOT_TOKEN } from './env';
import { prisma } from './prisma';
import { SET_ADDRESS_SCENE, setAddressScene } from './set-address-scene';

const bot = new Telegraf<Scenes.SceneContext>(BOT_TOKEN);

bot.use(session());
bot.use(new Scenes.Stage([setAddressScene()]).middleware());

bot.start(async (ctx) => {
  const user: Omit<User, 'address'> = {
    id: ctx.from.id,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name ?? null,
    username: ctx.from.username ?? null,
  };

  const savedUser = await prisma.user.upsert({
    where: { id: ctx.from.id },
    create: user,
    update: user,
  });

  await ctx.reply(`Здравствуйте, ${ctx.from.first_name}!`);

  if (!savedUser.address) {
    await ctx.scene.enter(SET_ADDRESS_SCENE);
  }
});

bot.help((ctx) => ctx.reply('Укажите адрес, передавайте показания по запросу бота.'));

bot.command(BotCommand.SetAddress, Scenes.Stage.enter<Scenes.SceneContext>(SET_ADDRESS_SCENE));

bot.command(BotCommand.GetAddress, async (ctx) => {
  const user = await prisma.user.findUnique({ where: { id: ctx.from.id } });

  if (user?.address) {
    await ctx.reply(`Ваш адрес: ${user.address}`);
  } else {
    await ctx.scene.enter(SET_ADDRESS_SCENE);
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
