const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

function createErrorEmbed(interaction, client) {
    return new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(interaction)
        .setFooter({ 
            text: 'Trixyma — Simple. Fast. Effective.',
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();
}

function createSuccessEmbed(interaction, client) {
    return new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('✅ Success')
        .setDescription(interaction)
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
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user for a specified duration')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration (example: 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Permission Denied**\n\n' +
                    '❌ You do not have permission to use this command.\n' +
                    '🔰 Required permission: Administrator\n\n' +
                    'Please contact a server administrator if you believe this is a mistake.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Bot Permission Error**\n\n' +
                    '❌ I don\'t have permission to mute users.\n' +
                    '🔰 Required permission: Moderate Members\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');
        const target = await interaction.guild.members.fetch(targetUser.id);
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Invalid User**\n\n' +
                    '❌ Could not find the specified user.\n' +
                    '💭 Make sure the user is in the server.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        if (!target.moderatable) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Cannot Mute User**\n\n' +
                    '❌ I cannot mute this user.\n' +
                    '💭 This might be because:\n' +
                    '• They have a higher role than me\n' +
                    '• They are the server owner\n' +
                    '• They have administrator permissions',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        const match = durationStr.match(/^(\d+)([smhd])$/);
        if (!match) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Duration Format**\n\n' +
                    '❌ Invalid duration format! Use a number followed by s/m/h/d (example: 10m, 1h, 1d).\n' +
                    '💭 Max duration: 28 days.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        const [, time, unit] = match;
        const duration = parseDuration(parseInt(time), unit);

        if (duration <= 0 || duration > 2419200000) { // Max 28 days
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Duration**\n\n' +
                    '❌ Duration must be greater than 0 and no more than 28 days!',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        try {
            await target.timeout(duration, reason);
            const successEmbed = createSuccessEmbed(
                `**User Muted Successfully**\n\n` +
                `👥 User: ${target}\n` +
                `⏱️ Duration: ${formatDuration(parseInt(time), unit)}\n` +
                `📋 Reason: ${reason}\n` +
                `🔰 Muted by: ${interaction.user.tag}`,
                interaction.client
            )
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await interaction.channel.send({ embeds: [successEmbed] });
            await interaction.reply({ content: 'User has been muted successfully!', ephemeral: true });
        } catch (error) {
            console.error('Error while muting user:', error);
            await interaction.reply({
                embeds: [createErrorEmbed(
                    '**Mute Failed**\n\n' +
                    '❌ An error occurred while trying to mute the user.\n' +
                    '💭 Please try again or contact support if the issue persists.',
                    interaction.client
                )],
                ephemeral: true
            });
        }
    }
}; 