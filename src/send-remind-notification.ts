import { bot } from './bot';
import { BotCommand } from './commands/bot-command';
import { prisma } from './prisma';

export async function sendRemindNotification() {
  const users = await prisma.user.findMany();
  await Promise.allSettled(
    users.map((user) =>
      bot.telegram.sendMessage(
        user.id,
        `Пора отправить показания за воду! Используйте команду /${BotCommand.LogWater}`,
      ),
    ),
  );
}
