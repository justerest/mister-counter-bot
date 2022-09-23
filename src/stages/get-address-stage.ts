import { prisma } from '../prisma';
import { ReadonlyStage, Stage } from '../user-session';
import { SetAddressStage } from './set-address-stage';

export class GetAddressStage extends ReadonlyStage implements Stage {
  async onEnter(): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: this.ctx.user.id } });

    if (user?.address) {
      await this.ctx.sendMessage(`Ваш адрес: ${user.address}`);
      await this.ctx.nextStage();
    } else {
      await this.ctx.nextStage(new SetAddressStage());
    }
  }
}
