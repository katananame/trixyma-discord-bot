const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const categories = [
    {
        name: '🎮 Entertainment Commands',
        value: '`/dice` - Roll a dice\n`/coinflip` - Flip a coin',
        emoji: '🎮'
    },
    {
        name: '🛠️ Basic Commands',
        value: '`/help` - Show command list\n`/ping` - Check bot latency\n`/userinfo [user]` - Display information about a user\n`/serverinfo` - Display information about the server\n`/avatar [user]` - Display a user\'s avatar\n`/membercount` - Display the member count of the server',
        emoji: '🛠️'
    },
    {
        name: '🎵 Music Commands',
        value: '`/join` - Join your voice channel',
        emoji: '🎵'
    },
    {
        name: '💬 Text Channel Commands (Admin Only)',
        value: '`/clear [amount]` - Clear specified number of messages\n`/slowmode [duration] [overall_duration]` - Set slowmode for the current channel',
        emoji: '💬'
    },
    {
        name: '👮 Moderation (Admin Only)',
        value: '`/warn [user] [duration] [reason]` - Give timeout to user\n`/unwarn [user]` - Remove timeout from user\n`/ban [user] [reason]` - Ban a user from the server\n`/unban [userid]` - Unban a user from the server\n`/kick [user] [reason]` - Kick a user from the server\n`/mute [user] [duration] [reason]` - Mute a user for a specified duration\n`/unmute [user]` - Unmute a user',
        emoji: '👮'
    },
    {
        name: '🤖 Bot Info',
        value: '`/uptime` - Display the bot\'s uptime',
        emoji: '🤖'
    }
];

function createHelpEmbed(page, client) {
    const embed = new EmbedBuilder()
        .setColor('#9B59B6')
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
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows list of available commands'),
    async execute(interaction) {
        let currentPage = 0;
        const embed = createHelpEmbed(currentPage, interaction.client);
        const buttonRow = createButtons(currentPage);
        const selectRow = createSelectMenu();

        const helpMessage = await interaction.reply({
            embeds: [embed],
            components: [buttonRow, selectRow],
            ephemeral: true
        });

        const collector = helpMessage.createMessageComponentCollector({
            time: 300000 // 5 minutes
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'This menu is not for you!',
                    ephemeral: true
                });
            }

            if (i.isStringSelectMenu()) {
                const selectedCategory = i.values[0];
                if (selectedCategory === 'all') {
                    currentPage = 0;
                } else {
                    const categoryIndex = categories.findIndex(cat => cat.name === selectedCategory);
                    if (categoryIndex !== -1) {
                        currentPage = Math.floor(categoryIndex / 5);
                    }
                }
            } else {
                switch (i.customId) {
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

            const newEmbed = createHelpEmbed(currentPage, interaction.client);
            const newButtonRow = createButtons(currentPage);

            await i.update({
                embeds: [newEmbed],
                components: [newButtonRow, selectRow]
            });
        });

        collector.on('end', () => {
            interaction.editReply({
                components: []
            }).catch(() => {});
        });
    }
}; 