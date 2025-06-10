const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createErrorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Generate a random number')
        .addIntegerOption(option =>
            option.setName('min')
                .setDescription('Minimum number (default: 1)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('max')
                .setDescription('Maximum number (default: 100)')
                .setRequired(false)),
    cooldown: 5, // 5 seconds cooldown
    async execute(interaction) {
        const min = interaction.options.getInteger('min') ?? 1;
        const max = interaction.options.getInteger('max') ?? 100;

        if (min >= max) {
            return interaction.reply({
                embeds: [createErrorEmbed('Minimum number must be less than maximum number!', interaction.client)],
                ephemeral: true
            });
        }

        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        const randomEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎲 Random Number Generator')
            .setDescription(`Your random number between **${min}** and **${max}** is:\n\n**${randomNumber}**`)
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [randomEmbed] });
    }
}; 