const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Give a timeout warning to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration (example: 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [createErrorEmbed('This command is only available to administrators!', interaction.client)],
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');
        const target = await interaction.guild.members.fetch(targetUser.id);
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason');

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({
                embeds: [createErrorEmbed('I don\'t have permission to timeout users!', interaction.client)],
                ephemeral: true
            });
        }

        if (!target) {
            return interaction.reply({
                embeds: [createErrorEmbed('Could not find the specified user!', interaction.client)],
                ephemeral: true
            });
        }

        if (!target.moderatable) {
            return interaction.reply({
                embeds: [createErrorEmbed('I cannot timeout this user! They might have a higher role.', interaction.client)],
                ephemeral: true
            });
        }

        const match = durationStr.match(/^(\d+)([smhd])$/);
        if (!match) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Invalid duration format!**\n\n' +
                    'Use: A number followed by s/m/h/d (example: 10m, 1h, 1d).\n' +
                    'Max duration: 28 days.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        const [, time, unit] = match;
        const duration = parseDuration(parseInt(time), unit);

        if (duration <= 0 || duration > 2419200000) {
            return interaction.reply({
                embeds: [createErrorEmbed('Duration must be greater than 0 and no more than 28 days!', interaction.client)],
                ephemeral: true
            });
        }

        try {
            await target.timeout(duration, reason);
            const successEmbed = createSuccessEmbed(
                `User ${target} has been timed out\n\n**Duration:** ${formatDuration(time, unit)}\n**Reason:** ${reason}`,
                interaction.client
            )
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await interaction.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while timing out user:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('An error occurred while timing out the user!', interaction.client)],
                ephemeral: true
            });
        }
    }
}; 