import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import { chatTable } from "./schema";

export const db = drizzle(env.DB, { schema: { chatTable } });
