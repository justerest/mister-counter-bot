import { gracefulShutdown, RecurrenceRule, scheduleJob } from 'node-schedule';

import { bot } from './bot';
import { AdminBotCommand } from './commands/admin-bot-command';
import { BotCommand } from './commands/bot-command';
import { ADMIN_ID } from './env';
import { sendRemindNotification } from './send-remind-notification';
import { sessionsService, switchStage } from './sessions-service';
import { GetAddressStage } from './stages/get-address-stage';
import { GetMonthReportStage } from './stages/get-month-report-stage';
import { HelpStage } from './stages/help-stage';
import { LogWaterStage } from './stages/log-water-stage';
import { SetAddressStage } from './stages/set-address-stage';
import { StartStage } from './stages/start-stage';
import { WaterLogHistoryStage } from './stages/water-log-history-stage';
import { UNKNOWN_MESSAGE_REPLY } from './user-session';

bot.start(switchStage(() => new StartStage()));

bot.help(switchStage(() => new HelpStage()));

bot.command(
  BotCommand.GetAddress,
  switchStage(() => new GetAddressStage()),
);

bot.command(
  BotCommand.SetAddress,
  switchStage(() => new SetAddressStage()),
);

bot.command(
  BotCommand.LogWater,
  switchStage(() => new LogWaterStage()),
);

bot.command(
  BotCommand.WaterLogHistory,
  switchStage(() => new WaterLogHistoryStage()),
);

bot.command(AdminBotCommand.EmitRemindNotification, async (ctx) => {
  if (ctx.from.id === ADMIN_ID) {
    await sendRemindNotification();
  } else {
    await ctx.reply(UNKNOWN_MESSAGE_REPLY);
  }
});

bot.command(AdminBotCommand.GetMonthReport, async (ctx) => {
  if (ctx.from.id === ADMIN_ID) {
    await sessionsService
      .get(ctx.from)
      .then((userSession) => userSession.switchStageForce(new GetMonthReportStage()));
  } else {
    await ctx.reply(UNKNOWN_MESSAGE_REPLY);
  }
});

bot.on('text', (ctx) =>
  sessionsService
    .get(ctx.from)
    .then((userSession) => userSession.handleTextMessage(ctx.message.text)),
);

bot.on('message', (ctx) => ctx.reply(UNKNOWN_MESSAGE_REPLY));

bot.launch();

scheduleJob(getRecurrenceRule(), () => sendRemindNotification());

process.on('SIGINT', () => gracefulShutdown());
process.on('SIGTERM', () => gracefulShutdown());

function getRecurrenceRule(): RecurrenceRule {
  const reminder = new RecurrenceRule();

  reminder.date = 18;
  reminder.hour = 10;
  reminder.minute = 30;
  reminder.tz = 'Asia/Yekaterinburg';

  return reminder;
}
