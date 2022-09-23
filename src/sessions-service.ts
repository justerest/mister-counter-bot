import { User } from '@prisma/client';
import { User as TgUser } from 'telegraf/typings/core/types/typegram';

import { bot } from './bot';
import { prisma } from './prisma';
import { Stage, UserSession } from './user-session';

const sessionMap: Map<number, UserSession> = new Map();

export const sessionsService = {
  get: async (tgUser: TgUser | User): Promise<UserSession> => {
    if (!sessionMap.has(tgUser.id)) {
      const userUpdate: Omit<User, 'address'> = {
        id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
      };

      const user = await prisma.user.upsert({
        where: { id: tgUser.id },
        create: userUpdate,
        update: userUpdate,
      });

      const userSession = new UserSession(user, (text) => bot.telegram.sendMessage(user.id, text));

      sessionMap.set(user.id, userSession);
    }

    return sessionMap.get(tgUser.id) as UserSession;
  },
};

export function switchStage(stage: () => Stage) {
  return async (ctx: { from: TgUser }) => {
    const userSession = await sessionsService.get(ctx.from);
    return await userSession.switchStageForce(stage());
  };
}
