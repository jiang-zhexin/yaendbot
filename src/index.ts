import { Bot, webhookCallback } from "grammy/web";
import { Hono } from "hono";
import { env } from "cloudflare:workers";

import { msg } from "./msg";
import { log } from "./log";
import { chat } from "./chat";
//@ts-ignore
import robots from "./robots.txt";

const bot = new Bot(env.BOT_TOKEN, { botInfo: env.BOT_INFO });
bot.use(log);
bot.use(msg);
bot.use(chat);

const app = new Hono();

app.post("/", async (c) => {
  return webhookCallback(bot, "cloudflare-mod", {
    secretToken: env.secret_token,
    timeoutMilliseconds: 60000,
  })(c.req.raw).catch((err) => {
    console.error(err);
    return new Response(null, { status: 200 });
  });
});

app.get("/robots.txt", async (c) => {
  return c.text(robots);
});

app.get("/download/:type/:path", async (c) => {
  const { type, path } = c.req.param();
  return fetch(
    `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${type}/${path}`
  );
});

export default app;
