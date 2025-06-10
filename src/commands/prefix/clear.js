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
            
            return message.channel.send({ embeds: [errorEmbed] });
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
            
            return message.channel.send({ embeds: [errorEmbed] });
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount });
            await message.channel.bulkDelete(messages);

            const successEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription(`✅ Successfully deleted ${messages.size} messages!`)
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: message.client.user.displayAvatarURL()
                })
                .setTimestamp();

            const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });
            setTimeout(() => confirmationMessage.delete().catch(() => {}), 5000);
        } catch (error) {
            console.error('Error clearing messages:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while clearing messages!')
                .setFooter({ 
                    text: 'Trixyma — Simple. Fast. Effective.',
                    iconURL: message.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            await message.channel.send({ embeds: [errorEmbed] });
        }
    }
}; 