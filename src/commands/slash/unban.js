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
        .setName('unban')
        .setDescription('Unban a user from the server')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('ID of the user to unban')
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

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({
                embeds: [createErrorEmbed(
                    '**Bot Permission Error**\n\n' +
                    '❌ I don\'t have permission to unban users.\n' +
                    '🔑 Required permission: Ban Members\n\n' +
                    'Please ask a server administrator to grant me the necessary permissions.',
                    interaction.client
                )],
                ephemeral: true
            });
        }

        const userId = interaction.options.getString('userid');

        try {

            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.find(ban => ban.user.id === userId);

            if (!bannedUser) {
                return interaction.reply({
                    embeds: [createErrorEmbed(
                        '**User Not Found**\n\n' +
                        '❌ This user is not currently banned.\n' +
                        '💡 Make sure you have the correct user ID.',
                        interaction.client
                    )],
                    ephemeral: true
                });
            }

            await interaction.guild.members.unban(userId);
            
            const successEmbed = createSuccessEmbed(
                `**User Unbanned Successfully**\n\n` +
                `👤 User: ${bannedUser.user.tag}\n` +
                `🛡️ Unbanned by: ${interaction.user.tag}`,
                interaction.client
            )
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(bannedUser.user.displayAvatarURL());

            await interaction.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while unbanning user:', error);
            await interaction.reply({
                embeds: [createErrorEmbed(
                    '**Unban Failed**\n\n' +
                    '❌ An error occurred while trying to unban the user.\n' +
                    '💡 Please try again or contact support if the issue persists.',
                    interaction.client
                )],
                ephemeral: true
            });
        }
    }
}; 