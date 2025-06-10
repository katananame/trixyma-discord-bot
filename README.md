# Trixyma Discord Bot

A modern Discord bot built with Discord.js v14, featuring both slash and prefix commands.

## Features

- **Dual Command System**: Both slash (/) and prefix (t!) commands
- **Interactive Help Menu**: Paginated help menu with category selection
- **Moderation Tools**: Message clearing, user management, and more
- **Entertainment Commands**: Dice rolling, coin flipping, and more
- **Beautiful Embeds**: Customizable colors for embeds via `config.js`
- **Admin Controls**: Secure moderation commands with administrator-only access

## Commands

### Entertainment Commands
- `/dice` or `t!dice` - Roll a dice
- `/coinflip` or `t!coinflip` - Flip a coin

### Basic Commands
- `/help` or `t!help` - Display all available commands
- `/ping` or `t!ping` - Check bot latency
- `/userinfo [user]` or `t!userinfo [user]` - Display information about a user
- `/serverinfo` or `t!serverinfo` - Display information about the server
- `/avatar [user]` or `t!avatar [user]` - Display a user's avatar
- `/membercount` or `t!membercount` - Display the member count of the server

### Music Commands
- `/join` or `t!join` - Join your voice channel

### Text Channel Commands (Admin Only)
- `/clear [amount]` or `t!clear [amount]` - Clear specified number of messages
- `/slowmode [duration] [overall_duration]` or `t!slowmode [duration] [overall_duration]` - Set slowmode for the current channel

### Moderation Commands (Admin Only)
- `/warn [user] [duration] [reason]` or `t!warn [user] [duration] [reason]` - Give timeout to user
- `/unwarn [user]` or `t!unwarn [user]` - Remove timeout from user
- `/ban [user] [reason]` or `t!ban [user] [reason]` - Ban a user from the server
- `/unban [userid]` or `t!unban [userid]` - Unban a user from the server
- `/kick [user] [reason]` or `t!kick [user] [reason]` - Kick a user from the server
- `/mute [user] [duration] [reason]` or `t!mute [user] [duration] [reason]` - Mute a user for a specified duration
- `/unmute [user]` or `t!unmute [user]` - Unmute a user

### Bot Info
- `/uptime` or `t!uptime` - Display the bot's uptime

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
│   │   ├── avatar.js
│   │   ├── ban.js
│   │   ├── clear.js
│   │   ├── coinflip.js
│   │   ├── dice.js
│   │   ├── help.js
│   │   ├── join.js
│   │   ├── kick.js
│   │   ├── membercount.js
│   │   ├── mute.js
│   │   ├── ping.js
│   │   ├── serverinfo.js
│   │   ├── slowmode.js
│   │   ├── unwarn.js
│   │   ├── unban.js
│   │   ├── unmute.js
│   │   ├── uptime.js
│   │   ├── userinfo.js
│   │   └── warn.js
│   └── prefix/      # Prefix commands
│       ├── avatar.js
│       ├── ban.js
│       ├── clear.js
│       ├── coinflip.js
│       ├── dice.js
│       ├── help.js
│       ├── join.js
│       ├── kick.js
│       ├── membercount.js
│       ├── mute.js
│       ├── ping.js
│       ├── serverinfo.js
│       ├── slowmode.js
│       ├── unwarn.js
│       ├── unban.js
│       ├── unmute.js
│       ├── uptime.js
│       ├── userinfo.js
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