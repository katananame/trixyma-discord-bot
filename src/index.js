require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const config = require('./config');
const { createErrorEmbed } = require('./utils/embeds');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ]
});

client.slashCommands = new Collection();
client.prefixCommands = new Collection();
client.cooldowns = new Collection();

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

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Available prefix commands:', Array.from(client.prefixCommands.keys()));
    console.log('Available slash commands:', Array.from(client.slashCommands.keys()));
    
    client.user.setPresence({
        activities: [{
            name: config.status.name,
            type: ActivityType.Streaming,
            url: config.status.url
        }],
        status: 'online'
    });
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.prefixCommands.has(commandName)) return;

    const command = client.prefixCommands.get(commandName);

    if (command.cooldown) {
        const { cooldowns } = client;
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = command.cooldown * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply({
                    embeds: [createErrorEmbed(
                        `**Command on Cooldown**\n\n` +
                        `⏳ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
                        client
                    )]
                });
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error('Error executing prefix command:', error);
        message.reply('An error occurred while executing the command.');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (!client.slashCommands.has(interaction.commandName)) {
        console.log(`Ignoring unknown command: ${interaction.commandName}`);
        return;
    }

    const command = client.slashCommands.get(interaction.commandName);

    if (command.cooldown) {
        const { cooldowns } = client;
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = command.cooldown * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({
                    embeds: [createErrorEmbed(
                        `**Command on Cooldown**\n\n` +
                        `⏳ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`,
                        interaction.client
                    )],
                    ephemeral: true
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }

    try {
        await command.execute(interaction);
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

client.login(process.env.TOKEN); 