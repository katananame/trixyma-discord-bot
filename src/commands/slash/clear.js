const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription('🟣 You do not have permission to use this command!')
                .setTimestamp();
            
            return interaction.reply({ 
                embeds: [errorEmbed], 
                flags: ['Ephemeral']
            });
        }

        const amount = interaction.options.getInteger('amount');

        try {
            await interaction.channel.bulkDelete(amount);
            
            const successEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription(`🟣 Successfully deleted ${amount} messages!`)
                .setTimestamp();
            
            await interaction.reply({ 
                embeds: [successEmbed], 
                flags: ['Ephemeral']
            });
        } catch (error) {
            console.error('Error clearing messages:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setDescription('🟣 An error occurred while deleting messages!')
                .setTimestamp();
            
            await interaction.reply({ 
                embeds: [errorEmbed], 
                flags: ['Ephemeral']
            });
        }
    },
}; 