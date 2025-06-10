const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll a dice'),
    async execute(interaction) {
        const result = Math.floor(Math.random() * 6) + 1;
        
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setDescription(`🎲 **You rolled a ${result}!**`)
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 