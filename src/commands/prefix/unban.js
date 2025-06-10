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
    name: 'unban',
    description: 'Unban a user from the server',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Permission Denied**\n\n' +
                    '❌ You do not have permission to use this command.\n' +
                    '🔑 Required permission: Administrator\n\n' +
                    'Please contact a server administrator if you believe this is a mistake.',
                    message.client
                )]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Bot Permission Error**\n\n' +
                    '❌ I don\'t have permission to unban users.\n' +
                    '🔑 Required permission: Ban Members\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    message.client
                )]
            });
        }

        if (args.length < 1) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Command Usage**\n\n' +
                    '❌ Please provide a user ID to unban.\n\n' +
                    '📝 Usage: `t!unban [userid]`\n' +
                    '💡 Example: `t!unban 123456789`\n\n' +
                    'Note: You can find user IDs by enabling Developer Mode in Discord settings.',
                    message.client
                )]
            });
        }

        const userId = args[0];

        try { 
            const bans = await message.guild.bans.fetch();
            const bannedUser = bans.find(ban => ban.user.id === userId);

            if (!bannedUser) {
                return message.reply({
                    embeds: [createErrorEmbed(
                        '**User Not Found**\n\n' +
                        '❌ This user is not currently banned.\n' +
                        '💡 Make sure you have the correct user ID.',
                        message.client
                    )]
                });
            }

            await message.guild.members.unban(userId);
            
            const successEmbed = createSuccessEmbed(
                `**User Unbanned Successfully**\n\n` +
                `👤 User: ${bannedUser.user.tag}\n` +
                `🛡️ Unbanned by: ${message.author.tag}`,
                message.client
            )
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setThumbnail(bannedUser.user.displayAvatarURL());

            await message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while unbanning user:', error);
            await message.reply({
                embeds: [createErrorEmbed(
                    '**Unban Failed**\n\n' +
                    '❌ An error occurred while trying to unban the user.\n' +
                    '💡 Please try again or contact support if the issue persists.',
                    message.client
                )]
            });
        }
    }
}; 