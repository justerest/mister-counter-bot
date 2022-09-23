import { BotCommand } from '../commands/bot-command';
import { prisma } from '../prisma';
import { ReadonlyStage, Stage } from '../user-session';

export class WaterLogHistoryStage extends ReadonlyStage implements Stage {
  async onEnter(): Promise<void> {
    const waterLogs = await prisma.waterLog.findMany({ where: { user_id: this.ctx.user.id } });

    if (waterLogs.length === 0) {
      await this.ctx.sendMessage(
        `Вы ещё не передавали показаний. Чтобы передать показания используйте команду /${BotCommand.LogWater}`,
      );
    } else {
      await this.ctx.sendMessage(
        waterLogs
          .map((waterLog) => `${waterLog.created_at.toLocaleDateString()} – ${waterLog.value}`)
          .join('\n'),
      );
    }

    await this.ctx.nextStage();
  }
}
