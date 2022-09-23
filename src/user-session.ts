import { User } from '@prisma/client';

export const UNKNOWN_MESSAGE_REPLY: string =
  'Простите, не понимаю, что происходит. Выберите команду из списка меню.';

export interface SessionContext {
  readonly user: User;
  nextStage(stage?: Stage): Promise<void>;
  sendMessage(text: string): Promise<unknown>;
}

export interface Stage {
  provideContext(context: SessionContext): void;
  onEnter?(): Promise<void>;
  handleTextMessage(textMessage: string): Promise<void>;
  onAbort?(): Promise<void>;
}

export abstract class BaseStage implements Stage {
  protected ctx!: SessionContext;

  provideContext(ctx: SessionContext): void {
    this.ctx = ctx;
  }

  abstract handleTextMessage(textMessage: string): Promise<void>;
}

export class DefaultStage extends BaseStage implements Stage {
  async handleTextMessage(): Promise<void> {
    await this.ctx.sendMessage(UNKNOWN_MESSAGE_REPLY);
  }
}

export abstract class ReadonlyStage extends BaseStage implements Stage {
  abstract onEnter(): Promise<void>;

  async handleTextMessage(): Promise<void> {
    throw new Error("ReadonlyStage can't handle messages");
  }

  async onAbort(): Promise<void> {
    throw new Error("ReadonlyStage can't be aborted");
  }
}

export class UserSession {
  private stage: Stage = new DefaultStage();

  constructor(
    private readonly user: User,
    private sendMessage: (text: string) => Promise<unknown>,
  ) {
    this.provideContextToStage();
  }

  private provideContextToStage(): void {
    this.stage?.provideContext({
      user: this.user,
      nextStage: (stage) => this.switchStage(stage ?? new DefaultStage()),
      sendMessage: (text) => this.sendMessage(text),
    });
  }

  private async switchStage(stage: Stage): Promise<void> {
    this.stage = stage;
    this.provideContextToStage();
    await this.stage.onEnter?.();
  }

  async switchStageForce(stage: Stage): Promise<void> {
    await this.stage.onAbort?.();
    await this.switchStage(stage);
  }

  async handleTextMessage(textMessage: string): Promise<void> {
    await this.stage.handleTextMessage(textMessage);
  }
}
