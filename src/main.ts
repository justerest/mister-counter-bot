import { User } from '@prisma/client';
import { gracefulShutdown, RecurrenceRule, scheduleJob } from 'node-schedule';
import { Scenes, session } from 'telegraf';

import { bot } from './bot';
import { ADMIN_BOT_COMMAND_DESCRIPTION_MAP, AdminBotCommand } from './commands/admin-bot-command';
import { BotCommand } from './commands/bot-command';
import { ADMIN_ID } from './env';
import { prisma } from './prisma';
import { LOG_WATER_SCENE, logWaterScene } from './scenes/log-water-scene';
import { SET_ADDRESS_SCENE, setAddressScene } from './scenes/set-address-scene';
import { sendRemindNotification } from './send-remind-notification';

const UNKNOWN_MESSAGE_REPLY: string =
  'Простите, не понимаю, что происходит. Выберите команду из списка меню.';

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

bot.help(async (ctx) => {
  await ctx.reply('Укажите адрес, передавайте показания по запросу бота.');

  if (ctx.from.id === ADMIN_ID) {
    const adminCommandsHelp = Object.values(AdminBotCommand)
      .map((command) => `/${command} – ${ADMIN_BOT_COMMAND_DESCRIPTION_MAP[command]}`)
      .join('\n');

    await ctx.reply(`Admin actions:\n${adminCommandsHelp}`);
  }
});

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

bot.command(AdminBotCommand.EmitRemindNotification, async (ctx) => {
  if (ctx.from.id === ADMIN_ID) {
    await ctx.scene.enter(LOG_WATER_SCENE);
  } else {
    await ctx.reply(UNKNOWN_MESSAGE_REPLY);
  }
});

bot.command(AdminBotCommand.GetMonthReport, async (ctx) => {
  if (ctx.from.id === ADMIN_ID) {
    const now = new Date();
    const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthWaterLogs = await prisma.waterLog.findMany({
      where: { created_at: { gte: monthStartDate } },
      include: { user: true },
      orderBy: { user: { address: 'asc' } },
    });

    const reports = monthWaterLogs.map((waterLog) =>
      [
        waterLog.created_at.toLocaleDateString('ru-RU'),
        waterLog.user.address ?? '(Адрес отсутствует)',
        waterLog.value,
      ].join('\n'),
    );

    await ctx.reply(reports.join('\n\n') || 'Показания не найдены');
  } else {
    await ctx.reply(UNKNOWN_MESSAGE_REPLY);
  }
});

bot.on('message', (ctx) => ctx.reply(UNKNOWN_MESSAGE_REPLY));

bot.launch();

const reminder = new RecurrenceRule(undefined, undefined, undefined, undefined, undefined, 55);
scheduleJob(reminder, () => sendRemindNotification());

process.on('SIGINT', () => gracefulShutdown());
process.on('SIGTERM', () => gracefulShutdown());
