const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display information about the server'),
    cooldown: 20, // 20 seconds cooldown
    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            return interaction.reply({
                embeds: [createErrorEmbed('**Error:** This command can only be used in a server.', interaction.client)],
                ephemeral: true
            });
        }

        const owner = await guild.fetchOwner();
        const memberCount = guild.memberCount;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const humanCount = memberCount - botCount;
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const totalChannels = guild.channels.cache.size;
        const roleCount = guild.roles.cache.size;
        const creationDate = guild.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const serverInfoEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`🌐 Server Info: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
                { name: '👑 Owner', value: `<@${owner.id}>`, inline: true },
                { name: '📅 Created On', value: `\`${creationDate}\``, inline: true },
                { name: '👥 Members', value: `\`${memberCount}\` (Humans: ${humanCount}, Bots: ${botCount})`, inline: false },
                { name: '💬 Channels', value: `\`${totalChannels}\` (Text: ${textChannels}, Voice: ${voiceChannels})`, inline: false },
                { name: '💎 Roles', value: `\`${roleCount}\``, inline: true },
                { name: '✨ Boost Level', value: `\`${guild.premiumTier}\``, inline: true },
                { name: '🚀 Boosts', value: `\`${guild.premiumSubscriptionCount || 0}\``, inline: true }
            )
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [serverInfoEmbed],
            ephemeral: false
        });
    }
}; 