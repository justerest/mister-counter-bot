import { ADMIN_ID } from './env';
import { prisma } from './prisma';
import { sessionsService } from './sessions-service';
import { LogWaterStage } from './stages/log-water-stage';

export async function sendRemindNotification(): Promise<void> {
  const users = await prisma.user.findMany({ where: { id: ADMIN_ID } });

  await Promise.allSettled(
    users.map((user) =>
      sessionsService
        .get(user)
        .then((userSession) => userSession.switchStageForce(new LogWaterStage())),
    ),
  );
}
