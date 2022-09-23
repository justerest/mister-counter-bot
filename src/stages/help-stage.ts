import { ADMIN_BOT_COMMAND_DESCRIPTION_MAP, AdminBotCommand } from '../commands/admin-bot-command';
import { ADMIN_ID } from '../env';
import { ReadonlyStage, Stage } from '../user-session';

export class HelpStage extends ReadonlyStage implements Stage {
  async onEnter(): Promise<void> {
    await this.ctx.sendMessage('Укажите адрес, передавайте показания по запросу бота.');

    if (this.ctx.user.id === ADMIN_ID) {
      const adminCommandsHelp = Object.values(AdminBotCommand)
        .map((command) => `/${command} – ${ADMIN_BOT_COMMAND_DESCRIPTION_MAP[command]}`)
        .join('\n');

      await this.ctx.sendMessage(`Admin actions:\n${adminCommandsHelp}`);
    }

    await this.ctx.nextStage();
  }
}
