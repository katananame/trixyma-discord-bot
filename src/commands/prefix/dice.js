const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dice',
    description: 'Roll a dice',
    cooldown: 20, // 20 seconds cooldown
    async execute(message, args, client) {
        const result = Math.floor(Math.random() * 6) + 1;
        
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setDescription(`🎲 **You rolled a ${result}!**`)
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
}; 