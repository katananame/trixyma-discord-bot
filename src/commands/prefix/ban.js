const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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
 
function createSuccessEmbed(message, client) {
    return new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('✅ Success')
        .setDescription(message)
        .setFooter({ 
            text: 'Trixyma — Simple. Fast. Effective.',
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();
}

module.exports = {
    name: 'ban',
    description: 'Ban a user from the server',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Permission Denied**\n\n' +
                    '❌ You do not have permission to use this command.\n' +
                    '🔰 Required permission: Administrator\n\n' +
                    'Please contact a server administrator if you believe this is a mistake.',
                    message.client
                )]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Bot Permission Error**\n\n' +
                    '❌ I don\'t have permission to ban users.\n' +
                    '🔰 Required permission: Ban Members\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    message.client
                )]
            });
        }

        if (args.length < 1) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Command Usage**\n\n' +
                    '❌ Please mention a user to ban.\n\n' +
                    '📋 Usage: `t!ban @user [reason]`\n' +
                    '💭 Example: `t!ban @user Breaking server rules`',
                    message.client
                )]
            });
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid User**\n\n' +
                    '❌ Could not find the mentioned user.\n' +
                    '💭 Make sure to use a valid user mention (@user).',
                    message.client
                )]
            });
        }

        if (!target.bannable) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Cannot Ban User**\n\n' +
                    '❌ I cannot ban this user.\n' +
                    '💭 This might be because:\n' +
                    '• They have a higher role than me\n' +
                    '• They are the server owner\n' +
                    '• They have administrator permissions',
                    message.client
                )]
            });
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await target.ban({ reason: reason });
            const successEmbed = createSuccessEmbed(
                `**User Banned Successfully**\n\n` +
                `👥 User: ${target}\n` +
                `📋 Reason: ${reason}\n` +
                `🔰 Banned by: ${message.author.tag}`,
                message.client
            )
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while banning user:', error);
            await message.reply({
                embeds: [createErrorEmbed(
                    '**Ban Failed**\n\n' +
                    '❌ An error occurred while trying to ban the user.\n' +
                    '💭 Please try again or contact support if the issue persists.',
                    message.client
                )]
            });
        }
    }
}; 