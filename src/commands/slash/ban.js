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
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Permission Denied**\n\n' +
                    '❌ You do not have permission to use this command.\n' +
                    '🔑 Required permission: Administrator\n\n' +
                    'Please contact a server administrator if you believe this is a mistake.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Bot Permission Error**\n\n' +
                    '❌ I don\'t have permission to ban users.\n' +
                    '🔑 Required permission: Ban Members\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        if (!target) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Invalid User**\n\n' +
                    '❌ Could not find the specified user.\n' +
                    '💡 Make sure the user is still in the server.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        if (!target.bannable) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Cannot Ban User**\n\n' +
                    '❌ I cannot ban this user.\n' +
                    '💡 This might be because:\n' +
                    '• They have a higher role than me\n' +
                    '• They are the server owner\n' +
                    '• They have administrator permissions',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        try {
            await target.ban({ reason: reason });
            const successEmbed = createSuccessEmbed(
                `**User Banned Successfully**\n\n` +
                `👤 User: ${target}\n` +
                `📝 Reason: ${reason}\n` +
                `🛡️ Banned by: ${interaction.user.tag}`,
                interaction.client
            )
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await interaction.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while banning user:', error);
            await interaction.reply({
                embeds: [createErrorEmbed(
                    '**Ban Failed**\n\n' +
                    '❌ An error occurred while trying to ban the user.\n' +
                    '💡 Please try again or contact support if the issue persists.',
                    interaction.client
                )],
                ephemeral: true
            });
        }
    }
}; 