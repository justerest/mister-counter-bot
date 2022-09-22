import { bot } from './bot';
import { BotCommand } from './bot-command';

const COMMAND_DESCRIPTION_MAP: Record<BotCommand | 'help', string> = {
  [BotCommand.GetAddress]: 'Показать мой адрес',
  [BotCommand.SetAddress]: 'Изменить мой адрес',
  [BotCommand.LogWater]: 'Передать показания за воду',
  [BotCommand.WaterLogHistory]: 'История показаний за воду',
  [BotCommand.Help]: 'Помощь',
};

bot.telegram
  .setMyCommands(
    Object.values(BotCommand).map((command) => ({
      command,
      description: COMMAND_DESCRIPTION_MAP[command],
    })),
  )
  .then(() => console.log('Commands updated'));
