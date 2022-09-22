import { User } from '@prisma/client';
import { Scenes } from 'telegraf';

import { BotCommand } from './bot-command';
import { prisma } from './prisma';

export const SET_ADDRESS_SCENE: string = 'SET_ADDRESS_SCENE';

export function setAddressScene(): Scenes.BaseScene<Scenes.SceneContext> {
  const scene = new Scenes.BaseScene<Scenes.SceneContext>(SET_ADDRESS_SCENE);

  scene.enter((ctx) =>
    ctx.reply('Отправьте мне свой адрес, для которого будете передавать показания.'),
  );

  scene.on('text', async (ctx) => {
    const address = ctx.message.text;

    if (address.startsWith('/')) {
      const user = await prisma.user.findFirst({ where: { id: ctx.from.id } });

      await ctx.scene.leave();

      if (!user?.address) {
        await ctx.reply(`Ладно, отправите адрес позже через команду /${BotCommand.SetAddress}`);
      } else {
        await ctx.reply('Адрес не изменен');
      }

      return;
    }

    if (address.length < 6) {
      await ctx.reply(
        'Адрес не может быть таким коротким. Отправьте мне улицу, дом (и квартиру).\n\nНапример: ул. Коммуны, дом 2, кв. 15',
      );

      return;
    }

    const user: User = {
      id: ctx.from.id,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name ?? null,
      username: ctx.from.username ?? null,
      address,
    };

    await prisma.user.upsert({
      where: { id: ctx.from.id },
      create: user,
      update: user,
    });

    await ctx.reply('Спасибо! Ваш адрес сохранен!');
    await ctx.scene.leave();
  });

  return scene;
}
