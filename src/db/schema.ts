import {
  index,
  int,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const chatTable = sqliteTable(
  "chat",
  {
    chat_id: int().notNull(),
    message_id: int().notNull(),
    from_user_name: text(),
    date: int().notNull().default(0),
    message_type: text({ enum: ["text", "photo", "bot"] })
      .default("text")
      .notNull(),
    message: text(),
    reply_chat_id: int(),
    reply_message_id: int(),
    file_id: text(),
  },
  (table) => [
    primaryKey({ columns: [table.chat_id, table.message_id] }),
    index("date_idx").on(table.date),
  ],
);
