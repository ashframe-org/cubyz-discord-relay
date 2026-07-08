import { strict as assert } from "node:assert";
import test from "node:test";
import { createChatParser } from "../src/chatParser.js";
import { DEFAULT_CHAT_PATTERNS } from "../src/config.js";
import type { ChatPatterns } from "../src/types.js";

test("createChatParser captures multiline chat bodies with default patterns", () => {
  const parse = createChatParser(DEFAULT_CHAT_PATTERNS);
  const raw =
    "[***#6A5ACDM#8A2BE2e#9932CCr#C71585c#FF00FFu#FF69B4r***§#ffffff] hello\nworld";
  const chat = parse(raw);

  assert.ok(chat, "Expected chat message to be parsed");
  assert.equal(chat?.type, "chat");
  assert.equal(chat?.username, "Mercur");
  assert.equal(chat?.message, "hello\nworld");
  assert.ok(chat?.timestamp instanceof Date);
});

test("createChatParser parses join messages with default patterns", () => {
  const parse = createChatParser(DEFAULT_CHAT_PATTERNS);
  const result = parse("Steve joined");

  assert.ok(result);
  assert.equal(result?.type, "join");
  assert.equal(result?.username, "Steve");
  assert.equal(result?.message, undefined);
});

test("createChatParser parses leave messages with default patterns", () => {
  const parse = createChatParser(DEFAULT_CHAT_PATTERNS);
  const result = parse("Alex left");

  assert.ok(result);
  assert.equal(result?.type, "leave");
  assert.equal(result?.username, "Alex");
});

test("createChatParser parses death messages with default patterns", () => {
  const parse = createChatParser(DEFAULT_CHAT_PATTERNS);
  const result = parse("Steve died from a creeper");

  assert.ok(result);
  assert.equal(result?.type, "death");
  assert.equal(result?.username, "Steve");
  assert.equal(result?.message, "died from a creeper");
});

test("createChatParser returns null when no pattern matches", () => {
  const parse = createChatParser(DEFAULT_CHAT_PATTERNS);
  const result = parse("some random unstructured line");

  assert.equal(result, null);
});

test("custom chat pattern fully replaces default", () => {
  const patterns: ChatPatterns = {
    ...DEFAULT_CHAT_PATTERNS,
    chat: { pattern: "^<(?<username>[a-zA-Z0-9_]+)>\\s*(?<message>.*)$" },
  };
  const parse = createChatParser(patterns);

  const custom = parse("<Snale> hello world");
  assert.ok(custom);
  assert.equal(custom?.type, "chat");
  assert.equal(custom?.username, "Snale");
  assert.equal(custom?.message, "hello world");

  const oldFormat = parse("[Player] hello");
  assert.equal(oldFormat, null);
});

test("custom join pattern fully replaces default", () => {
  const patterns: ChatPatterns = {
    ...DEFAULT_CHAT_PATTERNS,
    join: { pattern: "^\\+\\s*(?<username>.+)$" },
  };
  const parse = createChatParser(patterns);

  const result = parse("+ Snale");
  assert.ok(result);
  assert.equal(result?.type, "join");
  assert.equal(result?.username, "Snale");

  // Default pattern no longer matches
  const oldFormat = parse("Snale joined");
  assert.equal(oldFormat, null);
});

test("pattern missing username named group is treated as no match", () => {
  const patterns: ChatPatterns = {
    ...DEFAULT_CHAT_PATTERNS,
    join: { pattern: "^(.+?) joined$" },
  };
  const parse = createChatParser(patterns);
  const result = parse("Player joined");

  // Without a named `username` group, the match is skipped and we fall through
  assert.equal(result, null);
});
