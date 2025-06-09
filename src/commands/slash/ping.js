const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),
    
    async execute(interaction) {
        const start = Date.now();
        await interaction.deferReply();
        const latency = Date.now() - start;
        const apiPing = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'API Latency', value: `${apiPing}ms`, inline: true },
                { name: 'Bot Response', value: `${latency}ms`, inline: true }
            )
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
}; 