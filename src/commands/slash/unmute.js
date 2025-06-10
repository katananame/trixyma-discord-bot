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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove mute from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove mute from')
                .setRequired(true))
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
                    '❌ I don\'t have permission to manage user timeouts.\n' +
                    '🔰 Required permission: Moderate Members\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        const target = interaction.options.getMember('user');

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
                    '**Cannot Unmute User**\n\n' +
                    '❌ I cannot manage this user\'s mute! They might have a higher role.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        if (!target.isCommunicationDisabled()) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**User Not Muted**\n\n' +
                    '❌ This user is not currently muted!',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        try {
            await target.timeout(null);
            const successEmbed = createSuccessEmbed(
                `**User Unmuted Successfully**\n\n` +
                `👥 User: ${target}\n` +
                `🔰 Unmuted by: ${interaction.user.tag}`,
                interaction.client
            )
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await interaction.channel.send({ embeds: [successEmbed] });
            await interaction.reply({ content: 'User has been unmuted successfully!', ephemeral: true });
        } catch (error) {
            console.error('Error while unmuting user:', error);
            await interaction.reply({
                embeds: [createErrorEmbed(
                    '**Unmute Failed**\n\n' +
                    '❌ An error occurred while trying to unmute the user.\n' +
                    '💭 Please try again or contact support if the issue persists.',
                    interaction.client
                )],
                ephemeral: true
            });
        }
    }
}; 