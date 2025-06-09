const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'coinflip',
    description: 'Flip a coin',
    async execute(message, args) {
        const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
        
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setDescription(`🪙 **${result}**!`)
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
}; 