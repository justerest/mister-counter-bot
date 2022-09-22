export enum AdminBotCommand {
  GetMonthReport = 'get_month_report',
  EmitRemindNotification = 'emit_remind_notification',
}

export const ADMIN_BOT_COMMAND_DESCRIPTION_MAP: Record<AdminBotCommand, string> = {
  [AdminBotCommand.GetMonthReport]: 'Отчет за текущий месяц',
  [AdminBotCommand.EmitRemindNotification]: 'Отправить тестовое напоминание про показания',
};
