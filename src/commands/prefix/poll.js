const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createErrorEmbed } = require('../../utils/embeds');

module.exports = {
    name: 'poll',
    description: 'Create a poll',
    cooldown: 5,
    async execute(message, args, client) {
        if (args.length < 2) {
            return message.channel.send({
                embeds: [createErrorEmbed(
                    '**Invalid Command Usage**\n\n' +
                    '❌ Please provide a question and options.\n\n' +
                    '📋 Usage: `t!poll <question> | <option1> | <option2> [| option3...]`\n' +
                    '💭 Example: `t!poll What\'s your favorite color? | Red | Blue | Green`',
                    client
                )]
            });
        }

        // Parse question and options
        const fullText = args.join(' ');
        const [question, ...optionsText] = fullText.split('|').map(part => part.trim());
        const options = optionsText.filter(opt => opt.length > 0);

        // Validate options
        if (options.length < 2) {
            return message.channel.send({
                embeds: [createErrorEmbed('You need to provide at least 2 options!', client)]
            });
        }

        if (options.length > 10) {
            return message.channel.send({
                embeds: [createErrorEmbed('You can only have up to 10 options!', client)]
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
                text: `Poll by ${message.author.tag} • Ends in 60 minutes`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp(Date.now() + 3600000);

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
        const pollMessage = await message.channel.send({
            embeds: [pollEmbed],
            components: rows
        });

        // Create collector for votes
        const collector = pollMessage.createMessageComponentCollector({
            time: 3600000 // 60 minutes
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

            // Update poll embed
            try {
                await message.edit({
                    embeds: [updatedEmbed],
                    components: rows
                });
            } catch (error) {
                if (error.code === 10008) {
                    // Unknown Message error, likely deleted
                    console.log("Poll message was deleted, cannot update.");
                    collector.stop(); // Stop the collector if message is gone
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
                    text: `Poll by ${message.author.tag} • Ended`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            // Edit the original message to show results
            try {
                await message.edit({
                    embeds: [resultsEmbed],
                    components: [],
                });
            } catch (error) {
                if (error.code === 10008) {
                    // Unknown Message error, likely deleted
                    console.log("Poll message was deleted, cannot send final results.");
                    return;
                } else {
                    console.error("Error sending final poll results:", error);
                }
            }
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