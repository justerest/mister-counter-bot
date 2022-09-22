import { Scenes } from 'telegraf';

import { BotCommand } from '../commands/bot-command';
import { prisma } from '../prisma';

export const LOG_WATER_SCENE: string = 'LOG_WATER_SCENE';

export function logWaterScene(): Scenes.BaseScene<Scenes.SceneContext> {
  const scene = new Scenes.BaseScene<Scenes.SceneContext>(LOG_WATER_SCENE);

  scene.enter(async (ctx) => {
    const dayOfMonth = new Date().getDate();
    if (15 <= dayOfMonth && dayOfMonth <= 21) {
      await ctx.reply('Отправьте мне показания счетчика холодной воды');
    } else {
      await ctx.scene.leave();
      await ctx.reply(
        'Показания принимаются с 15 по 18. Я отправлю вам напоминание, когда придет время.',
      );
    }
  });

  scene.on('text', async (ctx) => {
    const address = ctx.message.text;

    if (address.startsWith('/')) {
      await ctx.scene.leave();
      await ctx.reply(`Ладно, отправьте показания позже через команду /${BotCommand.LogWater}`);
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
