import { User } from '@prisma/client';
import { Scenes, session } from 'telegraf';

import { bot } from './bot';
import { BotCommand } from './bot-command';
import { LOG_WATER_SCENE, logWaterScene } from './log-water-scene';
import { prisma } from './prisma';
import { SET_ADDRESS_SCENE, setAddressScene } from './set-address-scene';

const scenes = new Scenes.Stage([setAddressScene(), logWaterScene()]);

bot.use(session());
bot.use(scenes.middleware());

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

bot.command(BotCommand.GetAddress, async (ctx) => {
  const user = await prisma.user.findUnique({ where: { id: ctx.from.id } });

  if (user?.address) {
    await ctx.reply(`Ваш адрес: ${user.address}`);
  } else {
    await ctx.scene.enter(SET_ADDRESS_SCENE);
  }
});

bot.command(BotCommand.SetAddress, Scenes.Stage.enter<Scenes.SceneContext>(SET_ADDRESS_SCENE));

bot.command(BotCommand.LogWater, Scenes.Stage.enter<Scenes.SceneContext>(LOG_WATER_SCENE));

bot.command(BotCommand.WaterLogHistory, async (ctx) => {
  const waterLogs = await prisma.waterLog.findMany({ where: { user_id: ctx.from.id } });

  if (waterLogs.length === 0) {
    await ctx.reply(
      `Вы ещё не передавали показаний. Чтобы передать показания используйте команду /${BotCommand.LogWater}`,
    );

    return;
  }

  await ctx.reply(
    waterLogs
      .map((waterLog) => `${waterLog.created_at.toLocaleDateString()} – ${waterLog.value}`)
      .join('\n'),
  );
});

bot.launch();
