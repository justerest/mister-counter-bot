import { User } from '@prisma/client';

import { prisma } from '../prisma';
import { ReadonlyStage, Stage } from '../user-session';
import { SetAddressStage } from './set-address-stage';

export class StartStage extends ReadonlyStage implements Stage {
  async onEnter(): Promise<void> {
    const userUpdate: Omit<User, 'address'> = {
      id: this.ctx.user.id,
      first_name: this.ctx.user.first_name,
      last_name: this.ctx.user.last_name ?? null,
      username: this.ctx.user.username ?? null,
    };

    const user = await prisma.user.upsert({
      where: { id: this.ctx.user.id },
      create: userUpdate,
      update: userUpdate,
    });

    await this.ctx.sendMessage(`Здравствуйте, ${this.ctx.user.first_name}!`);

    if (!user.address) {
      await this.ctx.nextStage(new SetAddressStage());
      return;
    }

    await this.ctx.nextStage();
  }
}
