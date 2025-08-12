import "dotenv/config";
import { Bot } from "grammy";

const bot = new Bot(process.env.BOT_TOKEN!);
await bot.init();
await bot.api.setMyCommands([{ command: "c", description: "chat!" }]);
