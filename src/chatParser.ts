import { cleanUsername } from "./messageFormatter.js";
import type { ChatMessage, ChatPatterns, EventType } from "./types.js";

const PATTERN_ORDER: EventType[] = ["chat", "join", "leave", "death"];

export function createChatParser(patterns: ChatPatterns) {
  const compiled = PATTERN_ORDER.map((type) => ({
    type,
    regex: new RegExp(patterns[type].pattern),
  }));

  return (message: string): ChatMessage | null => {
    const timestamp = new Date();

    for (const { type, regex } of compiled) {
      const match = regex.exec(message);
      if (!match) {
        continue;
      }

      const groups = match.groups ?? {};
      const rawUsername =
        typeof groups.username === "string" ? groups.username.trim() : "";
      if (rawUsername.length === 0) {
        continue;
      }

      const messageText =
        typeof groups.message === "string" ? groups.message : undefined;

      if (type === "death") {
        const reconstructed = `died${messageText ?? ""}`.trim();
        return {
          type,
          rawUsername,
          username: cleanUsername(rawUsername),
          message: reconstructed,
          timestamp,
        };
      }

      if (type === "chat") {
        const trimmedMessage = (messageText ?? "").trim();
        return {
          type,
          rawUsername,
          username: cleanUsername(rawUsername),
          message: trimmedMessage,
          timestamp,
        };
      }

      return {
        type,
        rawUsername,
        username: cleanUsername(rawUsername),
        timestamp,
      };
    }

    return null;
  };
}
