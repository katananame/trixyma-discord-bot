const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription('🟣 You do not have permission to use this command!')
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            return interaction.reply({ 
                embeds: [errorEmbed], 
                ephemeral: true
            });
        }

        const amount = interaction.options.getInteger('amount');

        try {
            let totalDeletedCount = 0;
            let remainingMessages = amount;

            while (remainingMessages > 0) {
                const batchSize = Math.min(remainingMessages, 100);
                const messages = await interaction.channel.messages.fetch({ limit: batchSize });
                if (messages.size === 0) break;
                
                await interaction.channel.bulkDelete(messages);
                totalDeletedCount += messages.size;
                remainingMessages -= batchSize;
            }
            
            const successEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription(`🟣 Successfully deleted ${totalDeletedCount} messages!`)
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            await interaction.reply({ 
                embeds: [successEmbed], 
                ephemeral: true
            });
        } catch (error) {
            console.error('Error clearing messages:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('🔴 An error occurred while deleting messages!')
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            await interaction.reply({ 
                embeds: [errorEmbed], 
                ephemeral: true
            });
        }
    },
}; 