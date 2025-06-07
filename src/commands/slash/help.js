const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows list of available commands'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('📚 Trixyma Commands')
            .setDescription('Hello! I\'m Trixyma - your server assistant. Here are my commands:')
            .addFields(
                { 
                    name: '🛠️ Basic Commands',
                    value: '`/help` - Show command list'
                },
                {
                    name: '👮 Moderation (Admin Only)',
                    value: '`/clear [amount]` - Clear specified number of messages'
                }
            )
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: ['Ephemeral']
        });
    }
}; 