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
    name: 'unmute',
    description: 'Remove mute from a user',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Permission Denied**\n\n' +
                    '❌ You do not have permission to use this command.\n' +
                    '🔰 Required permission: Administrator\n\n' +
                    'Please contact a server administrator if you believe this is a mistake.',
                    client
                )]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Bot Permission Error**\n\n' +
                    '❌ I don\'t have permission to manage user timeouts.\n' +
                    '🔰 Required permission: Moderate Members\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    client
                )]
            });
        }

        if (args.length < 1) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Command Usage**\n\n' +
                    '❌ Please mention a user to unmute.\n\n' +
                    '📋 Usage: `t!unmute @user`\n' +
                    '💭 Example: `t!unmute @user`',
                    client
                )]
            });
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid User**\n\n' +
                    '❌ Could not find the mentioned user.\n' +
                    '💭 Make sure to use a valid user mention.',
                    client
                )]
            });
        }

        if (!target.moderatable) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Cannot Unmute User**\n\n' +
                    '❌ I cannot manage this user\'s mute! They might have a higher role.',
                    client
                )]
            });
        }

        if (!target.isCommunicationDisabled()) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**User Not Muted**\n\n' +
                    '❌ This user is not currently muted!',
                    client
                )]
            });
        }

        try {
            await target.timeout(null);
            const successEmbed = createSuccessEmbed(
                `**User Unmuted Successfully**\n\n` +
                `👥 User: ${target}\n` +
                `🔰 Unmuted by: ${message.author.tag}`,
                client
            )
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while unmuting user:', error);
            await message.reply({
                embeds: [createErrorEmbed(
                    '**Unmute Failed**\n\n' +
                    '❌ An error occurred while trying to unmute the user.\n' +
                    '💭 Please try again or contact support if the issue persists.',
                    client
                )]
            });
        }
    }
}; 