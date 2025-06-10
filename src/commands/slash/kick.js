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
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking')
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

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Bot Permission Error**\n\n' +
                    '❌ I don\'t have permission to kick users.\n' +
                    '🔰 Required permission: Kick Members\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');
        const target = await interaction.guild.members.fetch(targetUser.id);
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

        if (!target.kickable) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Cannot Kick User**\n\n' +
                    '❌ I cannot kick this user.\n' +
                    '💭 This might be because:\n' +
                    '• They have a higher role than me\n' +
                    '• They are the server owner\n' +
                    '• They have administrator permissions',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        try {
            await target.kick(reason);
            const successEmbed = createSuccessEmbed(
                `**User Kicked Successfully**\n\n` +
                `👥 User: ${target}\n` +
                `📋 Reason: ${reason}\n` +
                `🔰 Kicked by: ${interaction.user.tag}`,
                interaction.client
            )
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await interaction.channel.send({ embeds: [successEmbed] });
            await interaction.reply({ content: 'User has been kicked successfully!', ephemeral: true });
        } catch (error) {
            console.error('Error while kicking user:', error);
            await interaction.reply({
                embeds: [createErrorEmbed(
                    '**Kick Failed**\n\n' +
                    '❌ An error occurred while trying to kick the user.\n' +
                    '💭 Please try again or contact support if the issue persists.',
                    interaction.client
                )],
                ephemeral: true
            });
        }
    }
}; 