const { EmbedBuilder } = require('discord.js');

function createErrorEmbed(message, client) {
    return new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(message)
        .setFooter({ 
            text: 'Trixyma — Simple. Fast. Effective.',
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();
}

module.exports = {
    name: 'membercount',
    description: 'Display the member count of the server',
    cooldown: 20, // 20 seconds cooldown
    async execute(message, args, client) {
        const guild = message.guild;

        if (!guild) {
            return message.reply({
                embeds: [createErrorEmbed('**Error:** This command can only be used in a server.', client)]
            });
        }

        const memberCount = guild.memberCount;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const humanCount = memberCount - botCount;

        const memberCountEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`👥 Member Count: ${guild.name}`)
            .setDescription(`Total Members: **${memberCount}**\nHumans: **${humanCount}**\nBots: **${botCount}**`)
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        await message.channel.send({ embeds: [memberCountEmbed] });
    }
}; 