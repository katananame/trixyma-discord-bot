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

function parseDuration(time, unit) {
    const units = {
        's': 1000,
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000
    };
    return time * (units[unit] || 0);
}

function formatDuration(time, unit) {
    switch (unit) {
        case 's': return `${time} seconds`;
        case 'm': return `${time} minutes`;
        case 'h': return `${time} hours`;
        case 'd': return `${time} days`;
        default: return `${time}ms`;
    }
}

module.exports = {
    name: 'mute',
    description: 'Mute a user for a specified duration',
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
                    '❌ I don\'t have permission to mute users.\n' +
                    '🔰 Required permission: Moderate Members\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    client
                )]
            });
        }

        if (args.length < 2) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Command Usage**\n\n' +
                    '❌ Please mention a user, duration, and reason.\n\n' +
                    '📋 Usage: `t!mute @user <duration> [reason]`\n' +
                    '💭 Example: `t!mute @user 1h Spamming`\n\n' +
                    'Duration formats: `10m` (10 minutes), `1h` (1 hour), `1d` (1 day).',
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
                    '**Cannot Mute User**\n\n' +
                    '❌ I cannot mute this user.\n' +
                    '💭 This might be because:\n' +
                    '• They have a higher role than me\n' +
                    '• They are the server owner\n' +
                    '• They have administrator permissions',
                    client
                )]
            });
        }

        const durationStr = args[1];
        const match = durationStr.match(/^(\d+)([smhd])$/);
        if (!match) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Duration Format**\n\n' +
                    '❌ Invalid duration format! Use a number followed by s/m/h/d (example: 10m, 1h, 1d).\n' +
                    '💭 Max duration: 28 days.',
                    client
                )]
            });
        }

        const [, time, unit] = match;
        const duration = parseDuration(parseInt(time), unit);

        if (duration <= 0 || duration > 2419200000) { // Max 28 days
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Duration**\n\n' +
                    '❌ Duration must be greater than 0 and no more than 28 days!',
                    client
                )]
            });
        }

        const reason = args.slice(2).join(' ') || 'No reason provided';

        try {
            await target.timeout(duration, reason);
            const successEmbed = createSuccessEmbed(
                `**User Muted Successfully**\n\n` +
                `👥 User: ${target}\n` +
                `⏱️ Duration: ${formatDuration(parseInt(time), unit)}\n` +
                `📋 Reason: ${reason}\n` +
                `🔰 Muted by: ${message.author.tag}`,
                client
            )
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while muting user:', error);
            await message.reply({
                embeds: [createErrorEmbed(
                    '**Mute Failed**\n\n' +
                    '❌ An error occurred while trying to mute the user.\n' +
                    '💭 Please try again or contact support if the issue persists.',
                    client
                )]
            });
        }
    }
}; 