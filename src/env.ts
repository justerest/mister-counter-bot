import * as dotenv from 'dotenv';

dotenv.config();

export const BOT_TOKEN: string = process.env['BOT_TOKEN'] ?? panic('No BOT_TOKEN provided');

export const ADMIN_ID: number = Number.parseInt(
  process.env['ADMIN_ID'] ?? panic('No ADMIN_ID provided'),
);

function panic(message: string): never {
  throw new Panic(message);
}

class Panic extends Error {}
