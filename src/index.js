require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const config = require('./config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ]
});

// Initialize collections for commands
client.slashCommands = new Collection();
client.prefixCommands = new Collection();

// Load prefix commands
const prefixCommandsPath = path.join(__dirname, 'commands', 'prefix');
if (fs.existsSync(prefixCommandsPath)) {
    const prefixCommandFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
    console.log('Found prefix command files:', prefixCommandFiles);

    for (const file of prefixCommandFiles) {
        try {
            delete require.cache[require.resolve(path.join(prefixCommandsPath, file))];
            const command = require(path.join(prefixCommandsPath, file));
            if (command.name && command.execute) {
                client.prefixCommands.set(command.name, command);
                console.log(`Loaded prefix command: ${command.name}`);
            }
        } catch (error) {
            console.error(`Error loading prefix command ${file}:`, error);
        }
    }
}

// Load slash commands
const slashCommandsPath = path.join(__dirname, 'commands', 'slash');
if (fs.existsSync(slashCommandsPath)) {
    const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
    console.log('Found slash command files:', slashCommandFiles);

    for (const file of slashCommandFiles) {
        try {
            delete require.cache[require.resolve(path.join(slashCommandsPath, file))];
            const command = require(path.join(slashCommandsPath, file));
            if (command.data && command.execute) {
                client.slashCommands.set(command.data.name, command);
                console.log(`Loaded slash command: ${command.data.name}`);
            }
        } catch (error) {
            console.error(`Error loading slash command ${file}:`, error);
        }
    }
}

// When bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Available prefix commands:', Array.from(client.prefixCommands.keys()));
    console.log('Available slash commands:', Array.from(client.slashCommands.keys()));
    
    // Set the bot's presence using config
    client.user.setPresence({
        activities: [{
            name: config.status.name,
            type: ActivityType.Streaming,
            url: config.status.url
        }],
        status: 'online'
    });
});

// Handle prefix commands
client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Игнорируем неизвестные команды
    if (!client.prefixCommands.has(commandName)) return;

    try {
        await client.prefixCommands.get(commandName).execute(message, args);
    } catch (error) {
        console.error('Error executing prefix command:', error);
        message.reply('An error occurred while executing the command.');
    }
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Игнорируем неизвестные команды
    if (!client.slashCommands.has(interaction.commandName)) {
        console.log(`Ignoring unknown command: ${interaction.commandName}`);
        return;
    }

    try {
        await client.slashCommands.get(interaction.commandName).execute(interaction);
    } catch (error) {
        console.error('Error executing slash command:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: 'An error occurred while executing the command.',
                flags: ['Ephemeral']
            }).catch(console.error);
        }
    }
});

// Login bot using token
client.login(process.env.TOKEN); 