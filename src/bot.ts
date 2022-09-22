import { Scenes, Telegraf } from 'telegraf';

import { BOT_TOKEN } from './env';

export const bot = new Telegraf<Scenes.SceneContext>(BOT_TOKEN);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
