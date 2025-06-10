const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createErrorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear specified number of messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true)
                .setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [createErrorEmbed('This command is only available to administrators!', interaction.client)],
                ephemeral: true
            });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                embeds: [createErrorEmbed('I don\'t have permission to delete messages!', interaction.client)],
                ephemeral: true
            });
        }

        const amount = interaction.options.getInteger('amount');

        try {
            let totalDeleted = 0;
            let remaining = amount;

            // Defer reply since this might take a while
            await interaction.deferReply({ ephemeral: true });

            while (remaining > 0) {
                const batchSize = Math.min(remaining, 100);
                const messages = await interaction.channel.messages.fetch({ limit: batchSize });
                const filteredMessages = messages.filter(msg => !msg.pinned);
                
                if (filteredMessages.size === 0) break;

                await interaction.channel.bulkDelete(filteredMessages, true);
                totalDeleted += filteredMessages.size;
                remaining -= batchSize;

                // Add a small delay to avoid rate limits
                if (remaining > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            if (totalDeleted === 0) {
                return interaction.editReply({
                    embeds: [createErrorEmbed('No messages found to delete!', interaction.client)]
                });
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('✅ Messages Cleared')
                .setDescription(`Successfully deleted **${totalDeleted}** messages!`)
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error clearing messages:', error);
            return interaction.editReply({
                embeds: [createErrorEmbed(
                    '**Error Clearing Messages**\n\n' +
                    '❌ An error occurred while trying to delete messages.\n' +
                    '⚠️ Messages older than 14 days cannot be bulk deleted.',
                    interaction.client
                )]
            });
        }
    }
}; 