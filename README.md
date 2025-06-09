# Trixyma Discord Bot

A modern Discord bot built with Discord.js v14, featuring both slash and prefix commands.

## Features

- **Dual Command System**: Both slash (/) and prefix (t!) commands
- **Moderation Tools**: Message clearing and more
- **Beautiful Embeds**: Customizable colors for embeds via `config.js`
- **Admin Controls**: Secure moderation commands with administrator-only access

## Commands

### Slash Commands
- `/help` - Display all available commands
- `/clear [amount]` - Clear specified number of messages (Admin only)
- `/coinflip` - Flip a coin
- `/warn [user] [duration] [reason]` - Give timeout to user (Admin only)
- `/unwarn [user]` - Remove timeout from user (Admin only)
- `/ping` - Check bot latency
- `/join` - Join your voice channel

### Prefix Commands
- `t!help` - Display all available commands
- `t!clear [amount]` - Clear specified number of messages (Admin only)
- `t!coinflip` - Flip a coin
- `t!warn [user] [duration] [reason]` - Give timeout to user (Admin only)
- `t!unwarn [user]` - Remove timeout from user (Admin only)
- `t!ping` - Check bot latency
- `t!join` - Join your voice channel

## Setup

1. **Install Dependencies:**
```bash
npm install
```

2. **Configure Environment:**
Create a `.env` file in the root directory with:
```env
TOKEN=your_bot_token
CLIENT_ID=your_application_client_id
```

3. **Register Slash Commands:**
```bash
node src/deploy-commands.js
```

4. **Start the Bot:**
For production:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
src/
├── commands/
│   ├── slash/       # Slash commands
│   │   ├── clear.js
│   │   ├── coinflip.js
│   │   ├── help.js
│   │   ├── join.js
│   │   ├── ping.js
│   │   ├── unwarn.js
│   │   └── warn.js
│   └── prefix/      # Prefix commands
│       ├── clear.js
│       ├── coinflip.js
│       ├── help.js
│       ├── join.js
│       ├── ping.js
│       ├── unwarn.js
│       └── warn.js
├── config.js        # Bot configuration
├── index.js         # Main bot file
└── deploy-commands.js   # Command registration
```

## Adding New Commands

1. Create a new command file in either `src/commands/slash/` or `src/commands/prefix/`
2. Follow the existing command structure
3. Run `node src/deploy-commands.js` to register new slash commands

## Requirements

- Node.js 16.9.0 or higher
- Discord.js v14
- A Discord Bot Token
- Administrator permissions for moderation commands