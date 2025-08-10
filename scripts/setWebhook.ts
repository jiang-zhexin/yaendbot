import "dotenv/config";
import { Bot } from "grammy";

const bot = new Bot(process.env.BOT_TOKEN);
await bot.init();
await bot.api.setWebhook(process.env.WEBHOOK, {
  secret_token: process.env.secret_token,
});
