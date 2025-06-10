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
        's': 1,
        'm': 60,
        'h': 3600
    };
    return time * (units[unit] || 0);
}

function parseOverallDuration(time, unit) {
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
        default: return `${time} seconds`;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode for the current channel')
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Slowmode duration (example: 10s, 5m, 1h, or 0 to disable)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('overall_duration')
                .setDescription('Overall duration for the slowmode to be active (example: 30m, 1h, 1d)')
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

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Bot Permission Error**\n\n' +
                    '❌ I don\'t have permission to manage channels.\n' +
                    '🔰 Required permission: Manage Channels\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        const durationStr = interaction.options.getString('duration');
        const overallDurationStr = interaction.options.getString('overall_duration');
        const match = durationStr.match(/^(\d+)([smh])?$/);
        let durationSeconds;

        if (durationStr === '0') {
            durationSeconds = 0;
        } else if (match) {
            const [, time, unit] = match;
            durationSeconds = parseDuration(parseInt(time), unit || 's'); // Default to seconds if no unit
        } else {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Duration Format**\n\n' +
                    '❌ Invalid duration format! Use a number followed by s/m/h (example: 10s, 10m, 1h) or 0 to disable.\n' +
                    '💭 Max duration: 6 hours (21600 seconds).',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        if (durationSeconds < 0 || durationSeconds > 21600) { // Max 6 hours (21600 seconds)
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Duration**\n\n' +
                    '❌ Duration must be between 0 and 6 hours (21600 seconds)!',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        let overallDurationMs = 0;
        let overallDurationFormatted = 'permanent';

        if (overallDurationStr) {
            const overallMatch = overallDurationStr.match(/^(\d+)([smhd])$/);
            if (!overallMatch) {
                return interaction.reply({
                    embeds: [createErrorEmbed(
                        '**Invalid Overall Duration Format**\n\n' +
                        '❌ Invalid overall duration format! Use a number followed by s/m/h/d (example: 30m, 1h, 1d).\n' +
                        '💭 Max duration: 28 days.',
                        interaction.client
                    )]
                });
            }
            const [, overallTime, overallUnit] = overallMatch;
            overallDurationMs = parseOverallDuration(parseInt(overallTime), overallUnit);
            overallDurationFormatted = formatDuration(parseInt(overallTime), overallUnit);

            if (overallDurationMs <= 0 || overallDurationMs > 2419200000) { // Max 28 days
                return interaction.reply({
                    embeds: [createErrorEmbed(
                        '**Invalid Overall Duration**\n\n' +
                        '❌ Overall duration must be greater than 0 and no more than 28 days!',
                        interaction.client
                    )]
                });
            }
        }

        try {
            await interaction.channel.setRateLimitPerUser(durationSeconds, `Slowmode set by ${interaction.user.tag}`);

            let description;
            if (durationSeconds === 0) {
                description = `**Slowmode Disabled Successfully**\n\n` +
                              `⏱️ Slowmode in this channel has been disabled.\n` +
                              `🔰 Disabled by: ${interaction.user.tag}`;
            } else {
                description = `**Slowmode Set Successfully**\n\n` +
                              `⏱️ Slowmode set to ${formatDuration(match ? parseInt(match[1]) : 0, match ? match[2] || 's' : 's')} in this channel.\n` +
                              `📋 Overall Duration: ${overallDurationFormatted}\n` +
                              `🔰 Set by: ${interaction.user.tag}`;
            }

            const successEmbed = createSuccessEmbed(description, interaction.client)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({
                embeds: [successEmbed],
                ephemeral: false
            });

            if (overallDurationMs > 0) {
                setTimeout(async () => {
                    try {
                        await interaction.channel.setRateLimitPerUser(0, 'Slowmode automatically disabled.');
                        const autoDisableEmbed = createSuccessEmbed(
                            `**Slowmode Automatically Disabled**\n\n` +
                            `⏱️ Slowmode in this channel has been automatically disabled after ${overallDurationFormatted}.`,
                            interaction.client
                        );
                        await interaction.channel.send({ embeds: [autoDisableEmbed] });
                    } catch (err) {
                        console.error('Error automatically disabling slowmode:', err);
                    }
                }, overallDurationMs);
            }

        } catch (error) {
            console.error('Error while setting slowmode:', error);
            await interaction.reply({
                embeds: [createErrorEmbed(
                    '**Slowmode Failed**\n\n' +
                    '❌ An error occurred while trying to set slowmode.\n' +
                    '💭 Please try again or contact support if the issue persists.',
                    interaction.client
                )],
                ephemeral: true
            });
        }
    }
}; 