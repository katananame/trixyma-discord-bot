const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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
        .setName('unwarn')
        .setDescription('Remove timeout from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove timeout from')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [createErrorEmbed('This command is only available to administrators!', interaction.client)],
                ephemeral: true
            });
        }

        const target = interaction.options.getMember('user');

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({
                embeds: [createErrorEmbed('I don\'t have permission to manage user timeouts!', interaction.client)],
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
                embeds: [createErrorEmbed('I cannot manage this user\'s timeout! They might have a higher role.', interaction.client)],
                ephemeral: true
            });
        }

        if (!target.isCommunicationDisabled()) {
            return interaction.reply({
                embeds: [createErrorEmbed('This user is not currently timed out!', interaction.client)],
                ephemeral: true
            });
        }

        try {
            await target.timeout(null);
            const successEmbed = createSuccessEmbed(
                `Timeout has been removed from ${target}`,
                interaction.client
            )
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await interaction.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while removing timeout:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('An error occurred while removing the timeout!', interaction.client)],
                ephemeral: true
            });
        }
    }
}; 