import { Composer } from "grammy";
import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";

import { chatTable } from "./db/schema";
import { getUsernameFromOrigin, getUsernameFromUser } from "./utils/username";

export const msg = new Composer();

msg.on(["edit:text", "msg:text", "msg:photo"], async (c, next) => {
  const db = drizzle(env.DB);

  const chatMsg: typeof chatTable.$inferInsert = {
    chat_id: c.chatId,
    date: c.msg.date,
    message_id: c.msgId,
    message_type: "text",
    message: c.msg.text,
    from_user_name: getUsernameFromUser(c.msg.from),
  };
  let isreply = false;
  const replyMsg: Omit<
    typeof chatTable.$inferInsert,
    "reply_chat_id" | "reply_message_id"
  > = {
    chat_id: 0,
    message_id: 0,
    message_type: "text",
  };

  if (c.msg.photo) {
    chatMsg.message_type = "photo";
    chatMsg.message = c.msg.caption;
    chatMsg.file_id = c.msg.photo[0].file_id;
  }

  if (c.msg.reply_to_message) {
    replyMsg.chat_id = c.chatId;
    replyMsg.message_id = c.msg.reply_to_message.message_id;
    replyMsg.date = c.msg.reply_to_message.date;
    replyMsg.from_user_name = getUsernameFromUser(c.msg.reply_to_message.from);
    if (c.msg.reply_to_message.photo?.at(-1)) {
      replyMsg.message_type = "photo";
      replyMsg.message = c.msg.reply_to_message.caption;
      replyMsg.file_id = c.msg.reply_to_message.photo.at(-1)!.file_id;
    } else {
      replyMsg.message = c.msg.reply_to_message.text;
    }
    isreply = true;
  } else if (
    c.msg.external_reply?.chat?.id &&
    c.msg.external_reply?.message_id
  ) {
    replyMsg.chat_id = c.msg.external_reply.chat.id;
    replyMsg.message_id = c.msg.external_reply.message_id;
    if (c.msg.external_reply.photo?.at(-1)) {
      replyMsg.message_type = "photo";
      replyMsg.file_id = c.msg.external_reply.photo.at(-1)!.file_id;
    }
    replyMsg.from_user_name = getUsernameFromOrigin(
      c.msg.external_reply.origin
    );
    replyMsg.message = c.msg.quote?.text;
    isreply = true;
  }

  if (isreply) {
    chatMsg.reply_chat_id = replyMsg.chat_id;
    chatMsg.reply_message_id = replyMsg.message_id;

    await db.batch([
      db
        .insert(chatTable)
        .values(chatMsg)
        .onConflictDoUpdate({
          target: [chatTable.chat_id, chatTable.message_id],
          set: {
            message: chatMsg.message,
            from_user_name: chatMsg.from_user_name,
          },
        }),
      db.insert(chatTable).values(replyMsg).onConflictDoNothing(),
    ]);
  } else
    await db
      .insert(chatTable)
      .values(chatMsg)
      .onConflictDoUpdate({
        target: [chatTable.chat_id, chatTable.message_id],
        set: {
          message: chatMsg.message,
          from_user_name: chatMsg.from_user_name,
        },
      });

  await next();
});
