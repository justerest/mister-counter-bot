import { BotCommand } from '../commands/bot-command';
import { prisma } from '../prisma';
import { BaseStage, Stage } from '../user-session';

export class SetAddressStage extends BaseStage implements Stage {
  async onEnter(): Promise<void> {
    await this.ctx.sendMessage(
      'Отправьте мне свой адрес, для которого будете передавать показания.',
    );
  }

  async handleTextMessage(address: string): Promise<void> {
    if (address.length < 6) {
      const ADDRESS_EXAMPLE = 'ул. Коммуны, дом 2, кв. 15';

      await this.ctx.sendMessage(
        `Адрес не может быть таким коротким. Отправьте мне улицу, дом (и квартиру).\n\nНапример: ${ADDRESS_EXAMPLE}`,
      );

      return;
    }

    await prisma.user.update({
      where: { id: this.ctx.user.id },
      data: { address },
    });

    await this.ctx.nextStage();
    await this.ctx.sendMessage('Спасибо! Ваш адрес сохранен!');
  }

  async onAbort(): Promise<void> {
    if (!this.ctx.user?.address) {
      await this.ctx.sendMessage(
        `Ладно, отправите адрес позже через команду /${BotCommand.SetAddress}`,
      );
    } else {
      await this.ctx.sendMessage('Адрес не изменен');
    }
  }
}
