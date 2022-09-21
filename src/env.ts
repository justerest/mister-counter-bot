import * as dotenv from 'dotenv';

dotenv.config();

export const BOT_TOKEN: string = process.env['BOT_TOKEN'] ?? panic('No BOT_TOKEN provided');

function panic(message: string): never {
  throw new Error(message);
}
