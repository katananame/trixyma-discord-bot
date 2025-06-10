const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
        .setName('membercount')
        .setDescription('Display the member count of the server'),
    cooldown: 20, // 20 seconds cooldown
    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            return interaction.reply({
                embeds: [createErrorEmbed('**Error:** This command can only be used in a server.', interaction.client)],
                ephemeral: true
            });
        }

        const memberCount = guild.memberCount;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const humanCount = memberCount - botCount;

        const memberCountEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`👥 Member Count: ${guild.name}`)
            .setDescription(`Total Members: **${memberCount}**\nHumans: **${humanCount}**\nBots: **${botCount}**`)
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [memberCountEmbed],
            ephemeral: false
        });
    }
}; 