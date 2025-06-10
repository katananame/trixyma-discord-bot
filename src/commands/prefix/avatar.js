const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Display a user\'s avatar',
    cooldown: 20,
    async execute(message, args, client) {
        const target = message.mentions.users.first() || message.author;

        const avatarEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`🖼️ Avatar of ${target.tag}`)
            .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        await message.channel.send({ embeds: [avatarEmbed] });
    }
}; 