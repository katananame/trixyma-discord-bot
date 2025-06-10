const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The poll question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Poll options separated by | (max 10 options)')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('anonymous')
                .setDescription('Make the poll anonymous (default: false)'))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Poll duration in minutes (default: 60)')
                .setMinValue(1)
                .setMaxValue(1440)),

    async execute(interaction, client) {
        const question = interaction.options.getString('question');
        const options = interaction.options.getString('options').split('|').map(opt => opt.trim());
        const isAnonymous = interaction.options.getBoolean('anonymous') ?? false;
        const duration = interaction.options.getInteger('duration') ?? 60;

        // Validate options
        if (options.length < 2) {
            return interaction.reply({
                content: 'You need to provide at least 2 options!',
                flags: [4096]
            });
        }

        if (options.length > 10) {
            return interaction.reply({
                content: 'You can only have up to 10 options!',
                flags: [4096]
            });
        }

        // Create poll embed
        const pollEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('📊 Poll')
            .setDescription(
                `**Вопрос:** **${question}**\n\n` +
                options.map((opt, i) => `${getEmoji(i)} **${opt}**`).join('\n\n')
            )
            .setFooter({ 
                text: `Poll by ${interaction.user.tag}${isAnonymous ? ' (Anonymous)' : ''} • Ends in ${duration} minutes`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp(Date.now() + duration * 60000);

        // Create buttons for each option
        const rows = [];
        for (let i = 0; i < options.length; i += 5) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 5 && i + j < options.length; j++) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`poll_${i + j}`)
                        .setLabel(getEmoji(i + j))
                        .setStyle(ButtonStyle.Primary)
                );
            }
            rows.push(row);
        }

        // Send poll
        const pollMessage = await interaction.reply({
            embeds: [pollEmbed],
            components: rows,
            fetchReply: true
        });

        // Create collector for votes
        const collector = pollMessage.createMessageComponentCollector({
            time: duration * 60000
        });

        // Store votes
        const votes = new Map();
        options.forEach((_, i) => votes.set(i, new Set()));

        collector.on('collect', async (i) => {
            const optionIndex = parseInt(i.customId.split('_')[1]);
            
            // Remove previous vote if exists
            for (const [index, voters] of votes.entries()) {
                if (voters.has(i.user.id)) {
                    voters.delete(i.user.id);
                }
            }

            // Add new vote
            votes.get(optionIndex).add(i.user.id);

            // Update poll embed
            const updatedEmbed = EmbedBuilder.from(pollEmbed.data);
            updatedEmbed.setDescription(
                `**Вопрос:** **${question}**\n\n` +
                options.map((opt, i) => {
                    const voteCount = votes.get(i).size;
                    const percentage = votes.get(i).size / Array.from(votes.values()).reduce((a, b) => a + b.size, 0) * 100 || 0;
                    const bar = createProgressBar(percentage);
                    return `${getEmoji(i)} **${opt}**\n${bar} ${voteCount} vote${voteCount !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)`;
                }).join('\n\n')
            );

            // Create action row for the updated buttons
            const actionRow = new ActionRowBuilder();
            for (let i = 0; i < options.length; i += 5) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 5 && i + j < options.length; j++) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`poll_${i + j}`)
                            .setLabel(getEmoji(i + j))
                            .setStyle(ButtonStyle.Primary)
                    );
                }
                actionRow.addComponents(row);
            }

            try {
                await i.update({
                    embeds: [updatedEmbed],
                    components: [actionRow],
                });
            } catch (error) {
                if (error.code === 10008) {
                    console.log("Poll message was deleted, cannot update.");
                    collector.stop();
                    return;
                } else {
                    console.error("Error updating poll message:", error);
                }
            }
        });

        collector.on('end', async collected => {
            // Create final results embed
            const resultsEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('📊 Poll Results')
                .setDescription(
                    `**Вопрос:** **${question}**\n\n` +
                    options.map((opt, i) => {
                        const voteCount = votes.get(i).size;
                        const percentage = votes.get(i).size / Array.from(votes.values()).reduce((a, b) => a + b.size, 0) * 100 || 0;
                        const bar = createProgressBar(percentage);
                        return `${getEmoji(i)} **${opt}**\n${bar} ${voteCount} vote${voteCount !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)`;
                    }).join('\n\n')
                )
                .setFooter({ 
                    text: `Poll by ${interaction.user.tag}${isAnonymous ? ' (Anonymous)' : ''} • Ended`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            // Edit the original message to show results
            try {
                await pollMessage.edit({
                    embeds: [resultsEmbed],
                    components: [],
                });
            } catch (error) {
                if (error.code === 10008) {
                    console.log("Poll message was deleted, cannot send final results.");
                    return;
                } else {
                    console.error("Error sending final poll results:", error);
                }
            }
        });

        collector.on('ignore', i => {
            // ... existing code ...
        });
    }
};

function getEmoji(index) {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[index];
}

function createProgressBar(percentage) {
    const filledBlocks = Math.round(percentage / 10);
    const emptyBlocks = 10 - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
} 