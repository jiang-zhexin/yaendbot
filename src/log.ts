import { Composer } from "grammy";

export const log = new Composer<MyContext>();

log.use(async (c, next) => {
  console.log(c.update);
  await next();
});
