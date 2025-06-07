const { EmbedBuilder } = require('discord.js');
const { prefix } = require('../../config.json');

module.exports = {
    name: 'help',
    description: 'Shows list of available commands',
    execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('📚 Trixyma Commands')
            .setDescription('Hello! I\'m Trixyma - your server assistant. Here are my commands:')
            .addFields(
                { 
                    name: '🛠️ Basic Commands',
                    value: `\`${prefix}help\` - Show command list`
                },
                {
                    name: '👮 Moderation (Admin Only)',
                    value: `\`${prefix}clear [amount]\` - Clear specified number of messages`
                }
            )
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
}; 