const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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
    const units = {
        's': ['Second', 'Seconds', 'Seconds'],
        'm': ['Minute', 'Minutes', 'Minutes'],
        'h': ['Hour', 'Hours', 'Hours'],
        'd': ['Day', 'Days', 'Days']
    };

    const forms = units[unit];
    const index = time === 1 ? 0 : 1;
    
    return `${time} ${forms[index]}`;
}

// Создаем функцию для генерации embed сообщений об ошибках
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

// Создаем функцию для генерации успешных embed сообщений
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
    name: 'warn',
    description: 'Give a timeout warning to a user',
    async execute(message, args) {
        // Check if user has Administrator permission
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply({
                embeds: [createErrorEmbed('This command is only available to administrators!', message.client)]
            });
        }

        // Check if bot has permission to timeout members
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply({
                embeds: [createErrorEmbed('I don\'t have permission to timeout users!', message.client)]
            });
        }

        // Check if there are enough arguments
        if (args.length < 2) {
            return message.reply({
                embeds: [createErrorEmbed('Incorrect command usage!\n\nUse: t!warn **[Nickname]** **[Time s/m/h]** **[Reason]**\n\nExample: t!warn @User 1h Breaking rules', message.client)]
            });
        }

        // Get the target user
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply({
                embeds: [createErrorEmbed('Please mention a user using @mention!', message.client)]
            });
        }

        // Check if the target can be timed out
        if (!target.moderatable) {
            return message.reply({
                embeds: [createErrorEmbed('I cannot timeout this user! They might have a higher role.', message.client)]
            });
        }

        // Parse duration
        const durationStr = args[1];
        const match = durationStr.match(/^(\d+)([smhd])$/);
        if (!match) {
            return message.reply({
                embeds: [createErrorEmbed('Invalid duration format! Use a number followed by s/m/h/d (example: 10m, 1h, 1d)', message.client)]
            });
        }

        const [, time, unit] = match;
        const duration = parseDuration(parseInt(time), unit);

        if (duration <= 0 || duration > 2419200000) { // Max 28 days
            return message.reply({
                embeds: [createErrorEmbed('Duration must be greater than 0 and no more than 28 days!', message.client)]
            });
        }

        // Get the reason
        const reason = args.slice(2).join(' ') || 'No reason provided';

        try {
            await target.timeout(duration, reason);
            const successEmbed = createSuccessEmbed(
                `User ${target} has been timed out\n\n**Duration:** ${formatDuration(time, unit)}\n**Reason:** ${reason}`,
                message.client
            )
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while timing out user:', error);
            await message.reply({
                embeds: [createErrorEmbed('An error occurred while timing out the user!', message.client)]
            });
        }
    }
}; 