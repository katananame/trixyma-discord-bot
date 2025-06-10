const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');

const categories = [
    {
        name: '🎮 Entertainment Commands',
        value: `\`${config.prefix}dice\` - Roll a dice\n\`${config.prefix}coinflip\` - Flip a coin\n\`${config.prefix}random [min-max]\` - Generate a random number\n\`${config.prefix}guess\` - Play a number guessing game\n\`${config.prefix}tictactoe\` - Play Tic-Tac-Toe with another player\n\`${config.prefix}poll\` - Create a poll with multiple options`,
        emoji: '🎮'
    },
    {
        name: '🛠️ Basic Commands',
        value: `\`${config.prefix}help\` - Show command list\n\`${config.prefix}ping\` - Check bot latency\n\`${config.prefix}userinfo [user]\` - Display information about a user\n\`${config.prefix}serverinfo\` - Display information about the server\n\`${config.prefix}membercount\` - Display the number of members in the server`,
        emoji: '🛠️'
    },
    {
        name: '🎵 Music Commands',
        value: `\`${config.prefix}join\` - Join your voice channel`,
        emoji: '🎵'
    },
    {
        name: '💬 Text Channel Commands (Admin Only)',
        value: `\`${config.prefix}clear [amount]\` - Clear specified number of messages\n\`${config.prefix}slowmode [duration] [overall_duration]\` - Set slowmode in the channel`,
        emoji: '💬'
    },
    {
        name: '👮 Moderation (Admin Only)',
        value: `\`${config.prefix}warn [user] [duration] [reason]\` - Give timeout to user\n\`${config.prefix}unwarn [user]\` - Remove timeout from user\n\`${config.prefix}ban [user] [reason]\` - Ban a user from the server\n\`${config.prefix}unban [userid]\` - Unban a user from the server\n\`${config.prefix}kick [user] [reason]\` - Kick a user from the server\n\`${config.prefix}mute [user] [duration] [reason]\` - Mute a user for a specified duration\n\`${config.prefix}unmute [user]\` - Unmute a user`,
        emoji: '👮'
    },
    {
        name: '🤖 Bot Info',
        value: `\`${config.prefix}uptime\` - Display the bot's uptime`,
        emoji: '🤖'
    }
];

function createHelpEmbed(page, client) {
    const embed = new EmbedBuilder()
        .setColor(config.colors.purple)
        .setTitle('📚 Trixyma Commands')
        .setDescription('Hello! I\'m Trixyma - your server assistant. Here are my commands:')
        .setFooter({ 
            text: `Page ${page + 1}/${Math.ceil(categories.length / 5)} • Trixyma — Simple. Fast. Effective.`,
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

    const startIndex = page * 5;
    const endIndex = Math.min(startIndex + 5, categories.length);
    
    for (let i = startIndex; i < endIndex; i++) {
        embed.addFields(categories[i]);
    }

    return embed;
}

function createButtons(page) {
    const totalPages = Math.ceil(categories.length / 5);
    
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('first')
                .setLabel('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages - 1),
            new ButtonBuilder()
                .setCustomId('last')
                .setLabel('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages - 1)
        );
}

function createSelectMenu() {
    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help-menu')
                .setPlaceholder('Select a category')
                .addOptions([
                    {
                        label: 'All Categories',
                        description: 'Show all available commands',
                        value: 'all',
                        emoji: '📚'
                    },
                    ...categories.map(category => ({
                        label: category.name.replace(/[^\w\s]/g, '').trim(),
                        description: `Show ${category.name.toLowerCase()}`,
                        value: category.name,
                        emoji: category.emoji
                    }))
                ])
        );
}

module.exports = {
    name: 'help',
    description: 'Shows list of available commands',
    async execute(message, args, client) {
        let currentPage = 0;
        const embed = createHelpEmbed(currentPage, client);
        const buttonRow = createButtons(currentPage);
        const selectRow = createSelectMenu();

        const helpMessage = await message.channel.send({
            embeds: [embed],
            components: [buttonRow, selectRow]
        });

        const collector = helpMessage.createMessageComponentCollector({
            time: 300000 // 5 minutes
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: 'This menu is not for you!',
                    ephemeral: true
                });
            }

            if (interaction.isStringSelectMenu()) {
                const selectedCategory = interaction.values[0];
                if (selectedCategory === 'all') {
                    currentPage = 0;
                } else {
                    const categoryIndex = categories.findIndex(cat => cat.name === selectedCategory);
                    if (categoryIndex !== -1) {
                        currentPage = Math.floor(categoryIndex / 5);
                    }
                }
            } else {
                switch (interaction.customId) {
                    case 'first':
                        currentPage = 0;
                        break;
                    case 'prev':
                        currentPage = Math.max(0, currentPage - 1);
                        break;
                    case 'next':
                        currentPage = Math.min(Math.ceil(categories.length / 5) - 1, currentPage + 1);
                        break;
                    case 'last':
                        currentPage = Math.ceil(categories.length / 5) - 1;
                        break;
                }
            }

            const newEmbed = createHelpEmbed(currentPage, client);
            const newButtonRow = createButtons(currentPage);

            await interaction.update({
                embeds: [newEmbed],
                components: [newButtonRow, selectRow]
            });
        });

        collector.on('end', () => {
            helpMessage.edit({
                components: []
            }).catch(() => {});
        });
    }
};