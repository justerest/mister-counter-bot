export enum BotCommand {
  GetAddress = 'get_address',
  SetAddress = 'set_address',
  LogWater = 'log_water',
  WaterLogHistory = 'water_log_history',
  Help = 'help',
}

export const BOT_COMMAND_DESCRIPTION_MAP: Record<BotCommand | 'help', string> = {
  [BotCommand.GetAddress]: 'Показать мой адрес',
  [BotCommand.SetAddress]: 'Изменить мой адрес',
  [BotCommand.LogWater]: 'Передать показания за воду',
  [BotCommand.WaterLogHistory]: 'История показаний за воду',
  [BotCommand.Help]: 'Помощь',
};
