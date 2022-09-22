import { Scenes } from 'telegraf';

import { BotCommand } from './bot-command';
import { prisma } from './prisma';

export const LOG_WATER_SCENE: string = 'LOG_WATER_SCENE';

export function logWaterScene(): Scenes.BaseScene<Scenes.SceneContext> {
  const scene = new Scenes.BaseScene<Scenes.SceneContext>(LOG_WATER_SCENE);

  scene.enter((ctx) => ctx.reply('Отправьте мне показания счетчика холодной воды'));

  scene.on('text', async (ctx) => {
    const address = ctx.message.text;

    if (address.startsWith('/')) {
      await ctx.scene.leave();
      await ctx.reply(`Ладно, отправите показания позже через команду /${BotCommand.LogWater}`);
      return;
    }

    await prisma.waterLog.create({
      data: {
        created_at: new Date(),
        value: ctx.message.text,
        user_id: ctx.from.id,
      },
    });

    await ctx.reply('Спасибо! Показания сохранены!');
    await ctx.scene.leave();
  });

  return scene;
}
