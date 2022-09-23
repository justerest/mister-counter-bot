import { BotCommand } from '../commands/bot-command';
import { prisma } from '../prisma';
import { BaseStage, Stage } from '../user-session';

export class LogWaterStage extends BaseStage implements Stage {
  async onEnter(): Promise<void> {
    const dayOfMonth = new Date().getDate();

    if (15 <= dayOfMonth && dayOfMonth <= 31) {
      await this.ctx.sendMessage('Отправьте мне показания счетчика холодной воды');
    } else {
      await this.ctx.sendMessage(
        'Показания принимаются с 15 по 18. Я отправлю вам напоминание, когда придет время.',
      );

      await this.ctx.nextStage();
    }
  }

  async handleTextMessage(waterLog: string): Promise<void> {
    await prisma.waterLog.create({
      data: {
        created_at: new Date(),
        value: waterLog,
        user_id: this.ctx.user.id,
      },
    });

    await this.ctx.sendMessage('Спасибо! Показания сохранены!');
    await this.ctx.nextStage();
  }

  async onAbort(): Promise<void> {
    await this.ctx.sendMessage(
      `Ладно, отправьте показания позже через команду /${BotCommand.LogWater}`,
    );
  }
}
