const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Clear messages from the channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription('🟣 You do not have permission to use this command!')
                .setTimestamp();
            
            return message.reply({ embeds: [errorEmbed] });
        }

        const amount = parseInt(args[0]);

        if (!amount || isNaN(amount)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription('🟣 Please specify the number of messages to delete!')
                .setTimestamp();
            
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            await message.channel.bulkDelete(amount);
            
            const successEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription(`🟣 Successfully deleted ${amount} messages!`)
                .setTimestamp();
            
            const reply = await message.channel.send({ embeds: [successEmbed] });
            
            // Automatically delete the success message after 5 seconds
            setTimeout(() => reply.delete().catch(() => {}), 5000);
        } catch (error) {
            console.error('Error clearing messages:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription('🟣 An error occurred while deleting messages!')
                .setTimestamp();
            
            message.reply({ embeds: [errorEmbed] });
        }
    },
}; 