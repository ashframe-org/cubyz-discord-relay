# Cubyz Discord Relay

`cubyz-discord-relay` is an application that relays [Cubyz](https://github.com/PixelGuys/Cubyz) game server chat events to Discord and forwards Discord chat back to the server.

![Cubyz Discord Relay](https://raw.githubusercontent.com/AMerkuri/cubyz-discord-relay/refs/heads/master/assets/discord.png)  
![Cubyz Server](https://raw.githubusercontent.com/AMerkuri/cubyz-discord-relay/refs/heads/master/assets/cubyz.png)

## Features

- Connects to the Cubyz server using game protocol over UDP as a bot player
- Relays join, leave, death, and chat events to Discord with presence updates
- Forwards Discord channel messages back into Cubyz, keeping role colors in-game
- Supports Discord message replies with context and emoji reactions relayed back to the server
- Provides a `/list` Discord command to show the players currently online
- Cleans Cubyz markdown-style usernames and censors configurable words
- Automatic reconnection with exponential backoff and retry limits
- Optional integration advertises your server on [servers.ashframe.net](https://servers.ashframe.net)

## Prerequisites

- Node.js 18 or newer
- Discord bot token with permission to read and post in the target channel (Message Content intent enabled)

## Installation

Install via npm:

```bash
npm install -g cubyz-discord-relay

# Start the relay (defaults to ./config.json)
cubyz-discord-relay

# Provide a custom config path
cubyz-discord-relay /path/to/config.json
```

You can also run once without a global install via `npx cubyz-discord-relay`.

## Discord Bot Setup

Your Discord bot requires these permissions:

- **View Channels** – Access the target channel
- **Send Messages** – Post Cubyz events and status updates

Additionally, enable the **Message Content Intent** for your bot in the Discord Developer Portal so it can read user messages to forward them to Cubyz.

Generate an invite link in the [Discord Developer Portal](https://discord.com/developers/applications) that grants these permissions before running the relay.

## Development

### Setup

```bash
npm install
```

### Configuration

1. Copy `config.example.json` to `config.json` (or run the application once to generate it automatically).
2. Update the sections:
   - `logLevel`: global log verbosity for the relay (`error`, `debug`, `info`, `warn`, `silent`)
   - `cubyz.host` / `cubyz.port`: address of the Cubyz UDP server
   - `cubyz.botName`: in-game name the relay uses when joining the server
   - `cubyz.version`: client version string to present during the Cubyz handshake
   - `discord.enabled`: enable/disable Discord relay functionality
   - `discord.token`: Discord bot token
   - `discord.channelId`: target channel ID
   - `discord.allowedMentions`: array of mention types (`roles`, `users`, `everyone`) to allow in Discord messages; defaults to an empty array to suppress mentions
   - `discord.enableReactions`: enable/disable relaying Discord reactions back to Cubyz; defaults to `true`
   - `discord.enableReplies`: enable/disable relaying Discord message replies with context back to Cubyz; defaults to `true`
   - `events`: subset of `join`, `leave`, `death`, `chat` to relay
   - `censorlist`: words to censor in chat messages
   - `startupMessages`: array of messages to send to Cubyz server on each connection (e.g., login commands)
   - `startupMessageDelay`: delay in milliseconds applied before each message in `startupMessages` (including the first); defaults to `0`
   - `excludeBotFromCount`: omit the relay bot from the player count when `true`
   - `excludedUsernames`: array of usernames to exclude from the player count (case-insensitive)
   - `connection.reconnect`: enable/disable automatic reconnect attempts
   - `connection.maxRetries`: maximum reconnect attempts (`0` = infinite)
   - `connection.retryDelayMs`: initial delay before retrying (milliseconds)
   - `chatPatterns`: user-configurable regex patterns for parsing Cubyz chat messages (see [Chat Patterns](#chat-patterns))

> First run convenience: if `config.json` is missing, the application writes a fresh template in your working directory and exits so you can fill it in before retrying.

### CubyzListSite Integration

This optional integration sends the relay's live online state and player count to the server record you own on [servers.ashframe.net](https://servers.ashframe.net). It does not read log files and does not affect Discord chat bridging.

#### Setup

1. Create a server listing at [servers.ashframe.net](https://servers.ashframe.net).
2. Open **Account → API & Tokens → Create Token**. Select the listing and create a **Discord Relay** token.
3. Copy the token immediately: it is shown only once. Do not share it or commit it to Git.
4. Add this section to `config.json` and replace the placeholder with the token:

```json
"integration": {
  "cubyzlistSite": {
    "enabled": true,
    "endpoint": "https://servers.ashframe.net",
    "token": "PASTE_YOUR_RELAY_TOKEN_HERE"
  }
}
```

5. Run `npm run build`, then `npm start`. A successful connection sends the server's status, version, and current player count to the selected listing.

The relay sends updates when it connects, when the game server status changes, when players change, and every five minutes while running. Discord chat bridging continues normally.

Server name, address, description, icon, and links are managed in the directory itself. Existing configurations may keep the older fields; they are ignored by this integration.

### Usage

```bash
npm run dev            # Compile and run with tsx
npm run build          # Compile TypeScript to dist/
npm start              # Run compiled output (after build)
```

During execution press `q` or `Ctrl+C` to exit gracefully.

### Chat Patterns

The `chatPatterns` section lets you customize how the relay recognizes chat, join, leave, and death messages from the Cubyz server. Each entry is keyed by event type (`chat`, `join`, `leave`, `death`) and contains a `pattern` string with **named capture groups**:

| Event type | Required groups | Message group |
| ---------- | ---------------- | ------------- |
| `chat`     | `username`       | `message`     |
| `join`     | `username`       | —             |
| `leave`    | `username`       | —             |
| `death`    | `username`       | `message`     |

- **Named groups**: patterns must use `(?<username>...)` and, where applicable, `(?<message>...)` to extract fields.
- **Per-type override**: supplying a pattern for an event type **fully replaces** the default for that type. If you omit a type, the built-in default is used.
- **No regex flags**: patterns are compiled as-is. Use `[\s\S]` to match across newlines (as the default `chat` pattern does).
- **Invalid regex**: if a pattern fails to compile, the application exits at startup with a configuration error.
- **Missing `username` group**: if a pattern matches but has no `username` capture group, the match is skipped and the parser falls through to the next event type.

Default patterns (also shown in `config.example.json`):

```json
{
  "chatPatterns": {
    "chat": {
      "pattern": "^\\[(?<username>.+?)\\]\\s*(?<message>[\\s\\S]*)$"
    },
    "join": {
      "pattern": "^(?<username>.+?) joined$"
    },
    "leave": {
      "pattern": "^(?<username>.+?) left$"
    },
    "death": {
      "pattern": "^(?<username>.+?) died(?<message>.*)$"
    }
  }
}
```

> **Note**: regex strings in JSON require double-backslash escaping (e.g., `\\[` for a literal `[`, `\\s` for whitespace).

## Troubleshooting

- **Bot not posting**: verify the Discord bot token, channel ID, and permissions
- **Bot stuck reconnecting**: ensure the Cubyz server is reachable and the configured version/name are allowed
- **Presence count wrong**: confirm `excludeBotFromCount` and `excludedUsernames` are set appropriately and the bot remains connected
- **No events forwarded**: check that the bot successfully joins the server (look for the "Bot connected" Discord message)

## Limitations

- **Requires player slot**: The relay consumes one in-game player slot while connected.

## Compatibility

| cubyz-discord-relay version | Required Cubyz version |
| --------------------------- | ---------------------- |
| 2.5.0+                      | 0.2.0+                 |
| 2.4.3                       | 0.0.0+                 |
