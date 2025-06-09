const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Clear messages from the channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription('🟣 You do not have permission to use this command!')
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: message.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            return message.reply({ embeds: [errorEmbed] });
        }

        const amount = parseInt(args[0]);

        if (!amount || isNaN(amount)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('🔴 Please specify the number of messages to delete!')
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: message.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            let totalDeletedCount = 0;
            let remainingMessages = amount;

            // Delete messages in batches of 100
            while (remainingMessages > 0) {
                const batchSize = Math.min(remainingMessages, 100);
                const messages = await message.channel.messages.fetch({ limit: batchSize });
                if (messages.size === 0) break; // No more messages to delete
                
                await message.channel.bulkDelete(messages);
                totalDeletedCount += messages.size;
                remainingMessages -= batchSize;
            }
            
            const successEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription(`🟣 Successfully deleted ${totalDeletedCount} messages!`)
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: message.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            const reply = await message.channel.send({ embeds: [successEmbed] });
            
            setTimeout(() => reply.delete().catch(() => {}), 5000);
        } catch (error) {
            console.error('Error clearing messages:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('🔴 An error occurred while deleting messages!')
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: message.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            message.reply({ embeds: [errorEmbed] });
        }
    },
}; 