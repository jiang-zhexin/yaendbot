import type { MessageOrigin, User } from "grammy/types";

export function getUsernameFromUser(
  user: User | undefined,
): string | undefined {
  if (user === undefined) {
    return;
  }
  return user.username ?? user.first_name + (user.last_name ?? "");
}

export function getUsernameFromOrigin(origin: MessageOrigin): string {
  switch (origin.type) {
    case "hidden_user":
      return origin.sender_user_name;
    case "user":
      return (
        origin.sender_user.first_name + (origin.sender_user.last_name ?? "")
      );
    case "chat":
      switch (origin.sender_chat.type) {
        case "supergroup":
        case "group":
        case "channel":
          return origin.sender_chat.title;
        case "private":
          return (
            origin.sender_chat.first_name + (origin.sender_chat.last_name ?? "")
          );
      }
    case "channel":
      return origin.chat.title;
  }
}
