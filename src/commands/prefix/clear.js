const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createErrorEmbed } = require('../../utils/embeds');

module.exports = {
    name: 'clear',
    description: 'Clear specified number of messages',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply({
                embeds: [createErrorEmbed('This command is only available to administrators!', client)]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply({
                embeds: [createErrorEmbed('I don\'t have permission to delete messages!', client)]
            });
        }

        if (!args[0]) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Command Usage**\n\n' +
                    '❌ Please specify the number of messages to delete.\n\n' +
                    '📋 Usage: `t!clear <amount>`\n' +
                    '💭 Example: `t!clear 1000`\n\n' +
                    '⚠️ Note: Messages older than 14 days cannot be deleted',
                    client
                )]
            });
        }

        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
            return message.reply({
                embeds: [createErrorEmbed('Please provide a valid positive number!', client)]
            });
        }

        try {
            let totalDeleted = 0;
            let remaining = amount;

            while (remaining > 0) {
                const batchSize = Math.min(remaining, 100);
                const messages = await message.channel.messages.fetch({ limit: batchSize });
                const filteredMessages = messages.filter(msg => !msg.pinned);
                
                if (filteredMessages.size === 0) break;

                await message.channel.bulkDelete(filteredMessages, true);
                totalDeleted += filteredMessages.size;
                remaining -= batchSize;

                // Add a small delay to avoid rate limits
                if (remaining > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            if (totalDeleted === 0) {
                return message.reply({
                    embeds: [createErrorEmbed('No messages found to delete!', client)]
                });
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('✅ Messages Cleared')
                .setDescription(`Successfully deleted **${totalDeleted}** messages!`)
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            const reply = await message.channel.send({ embeds: [successEmbed] });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
        } catch (error) {
            console.error('Error clearing messages:', error);
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Error Clearing Messages**\n\n' +
                    '❌ An error occurred while trying to delete messages.\n' +
                    '⚠️ Messages older than 14 days cannot be bulk deleted.',
                    client
                )]
            });
        }
    }
}; 