const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Display the bot\'s uptime'),
    cooldown: 20, // 20 seconds cooldown
    async execute(interaction) {
        let totalSeconds = (interaction.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        const uptimeEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('⏱️ Bot Uptime')
            .setDescription(`I have been online for: **${days}d ${hours}h ${minutes}m ${seconds}s**`)
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [uptimeEmbed],
            ephemeral: false
        });
    }
}; 