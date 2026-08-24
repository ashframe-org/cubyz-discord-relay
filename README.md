# Ashframe Cubyz Discord Relay

A bot that joins a Cubyz server and connects it to a Discord channel. It can also send live server status and player-count updates to the [Ashframe Cubyz Server Directory](https://servers.ashframe.net).

## What it does

- Relays Cubyz chat, joins, leaves, and deaths to Discord
- Sends Discord messages, replies, and reactions back to Cubyz
- Shows the current player count in the Discord bot presence
- Runs as a real Cubyz bot, so it does not depend on parsing server logs
- Updates a linked Ashframe server listing with live status, player count, version, and game mode

## Install

Requires Node.js 18 or newer.

```sh
git clone --branch main https://github.com/ashframe-org/cubyz-discord-relay.git
cd cubyz-discord-relay
npm install
cp config.example.json config.json
```

Edit `config.json`, then build and start the relay:

```sh
npm run build
npm start
```

Keep `config.json` private. It contains your Discord bot token and, if enabled, your directory relay token.

## Configuration

Set the Cubyz connection details:

```json
"cubyz": {
  "host": "127.0.0.1",
  "port": 47649,
  "botName": "Discord",
  "version": "0.3.0"
}
```

To use Discord chat relay, create a Discord application and bot, enable the **Message Content Intent**, invite it to your server with permission to view the channel and send messages, then set:

```json
"discord": {
  "enabled": true,
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "channelId": "YOUR_CHANNEL_ID"
}
```

The remaining options in `config.example.json` control events, reconnect behaviour, mention handling, reactions, and replies.

## Ashframe Directory

The generated configuration includes a disabled directory integration. To enable it:

1. Create your listing at [servers.ashframe.net](https://servers.ashframe.net).
2. In your account, open **API & Tokens → Create Token** and create a **Discord Relay** token for that server.
3. Update this block in `config.json`:

```json
"integration": {
  "cubyzlistSite": {
    "enabled": true,
    "endpoint": "https://servers.ashframe.net",
    "token": "YOUR_RELAY_TOKEN"
  }
}
```

The token is shown only once. Do not share it or commit it to Git.

## License and credit

Based on work by [AMerkuri](https://github.com/AMerkuri/cubyz-discord-relay). This fork remains available under the [MIT License](LICENSE).
