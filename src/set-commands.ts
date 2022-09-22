import { bot } from './bot';
import { BOT_COMMAND_DESCRIPTION_MAP, BotCommand } from './commands/bot-command';

bot.telegram
  .setMyCommands(
    Object.values(BotCommand).map((command) => ({
      command,
      description: BOT_COMMAND_DESCRIPTION_MAP[command],
    })),
  )
  .then(() => console.log('Commands updated'));
