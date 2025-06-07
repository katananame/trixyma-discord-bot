# Trixyma Discord Bot

A modern Discord bot built with Discord.js v14, featuring both slash and prefix commands.

## Features

- **Dual Command System**: Both slash (/) and prefix (t!) commands
- **Moderation Tools**: Message clearing and more
- **Beautiful Embeds**: All responses use elegant purple-themed embeds
- **Admin Controls**: Secure moderation commands with administrator-only access

## Commands

### Slash Commands
- `/help` - Display all available commands
- `/clear [amount]` - Clear specified number of messages (Admin only)

### Prefix Commands
- `t!help` - Display all available commands
- `t!clear [amount]` - Clear specified number of messages (Admin only)

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
│   │   ├── help.js
│   │   └── clear.js
│   └── prefix/      # Prefix commands
│       ├── help.js
│       └── clear.js
├── config.json      # Bot configuration
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