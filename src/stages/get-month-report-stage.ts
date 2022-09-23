import { prisma } from '../prisma';
import { ReadonlyStage, Stage } from '../user-session';

export class GetMonthReportStage extends ReadonlyStage implements Stage {
  async onEnter(): Promise<void> {
    const now = new Date();
    const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthWaterLogs = await prisma.waterLog.findMany({
      where: { created_at: { gte: monthStartDate } },
      include: { user: true },
      orderBy: { user: { address: 'asc' } },
    });

    const reports = monthWaterLogs.map((waterLog) =>
      [
        waterLog.created_at.toLocaleDateString('ru-RU'),
        waterLog.user.address ?? '(Адрес отсутствует)',
        waterLog.value,
      ].join('\n'),
    );

    await this.ctx.sendMessage(reports.join('\n\n') || 'Показания не найдены');
    await this.ctx.nextStage();
  }
}
