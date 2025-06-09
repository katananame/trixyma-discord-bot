const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin'),
    async execute(interaction) {
        const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
        
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setDescription(`🪙 **${result}**!`)
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 