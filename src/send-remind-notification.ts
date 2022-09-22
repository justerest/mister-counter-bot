import { bot } from './bot';
import { BotCommand } from './commands/bot-command';
import { prisma } from './prisma';

export async function sendRemindNotification() {
  const user = await prisma.user.findFirstOrThrow({ where: { username: 'justerest' } });
  await bot.telegram.sendMessage(user.id, `Отправьте показания за воду – /${BotCommand.LogWater}`);
}
