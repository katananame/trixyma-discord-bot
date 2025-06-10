const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
    name: 'userinfo',
    description: 'Display information about a user',
    cooldown: 20, // 20 seconds cooldown
    async execute(message, args, client) {
        const target = message.mentions.members.first() || message.member;
        const user = target.user;
        const member = target;

        const joinDate = member.joinedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const creationDate = user.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const roles = member.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => `<@&${role.id}>`)
            .join(', ') || 'None';

        const permissions = member.permissions.toArray()
            .map(p => `\`${p}\``)
            .join(', ') || 'None';

        const userInfoEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`👤 User Info: ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: `\`${user.id}\``, inline: true },
                { name: '🏷️ Discord Tag', value: `\`${user.tag}\``, inline: true },
                { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: '📅 Account Created', value: `\`${creationDate}\``, inline: true },
                { name: '📝 Joined Server', value: `\`${joinDate}\``, inline: true },
                { name: '📊 Level', value: 'N/A (No leveling system)', inline: true }, // Placeholder for level
                { name: '💎 Roles', value: roles, inline: false },
                { name: '🛡️ Permissions', value: `\`You have ${member.permissions.has(PermissionFlagsBits.Administrator) ? 'Administrator' : 'Regular'} permissions.\``, inline: false }
            )
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        await message.channel.send({ embeds: [userInfoEmbed] });
    }
}; 