const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    name: 'help',
    description: 'Shows list of available commands',
    execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.purple)
            .setTitle('📚 Trixyma Commands')
            .setDescription('Hello! I\'m Trixyma - your server assistant. Here are my commands:')
            .addFields(
                { 
                    name: '🛠️ Basic Commands',
                    value: `\`${config.prefix}help\` - Show command list\n\`${config.prefix}coinflip\` - Flip a coin\n\`${config.prefix}ping\` - Check bot latency`
                },
                {
                    name: '🎵 Music Commands',
                    value: `\`${config.prefix}join\` - Join your voice channel`,
                    inline: false
                },
                {
                    name: '👮 Moderation (Admin Only)',
                    value: `\`${config.prefix}clear [amount]\` - Clear specified number of messages\n\`${config.prefix}warn [user] [duration] [reason]\` - Give timeout to user\n\`${config.prefix}unwarn [user]\` - Remove timeout from user`
                }
            );

        message.channel.send({ embeds: [embed] });
    }
};