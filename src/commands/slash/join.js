const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

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
        .setName('join')
        .setDescription('Join your voice channel'),

    async execute(interaction) {
        const member = interaction.member;

        if (!member.voice.channel) {
            return interaction.reply({
                embeds: [createErrorEmbed('You need to be in a voice channel first!', interaction.client)],
                ephemeral: true
            });
        }

        try {
            const connection = joinVoiceChannel({
                channelId: member.voice.channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfMute: false
            });

            const successEmbed = createSuccessEmbed(
                `Joined voice channel: ${member.voice.channel.name}`,
                interaction.client
            )
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error joining voice channel:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Failed to join the voice channel!', interaction.client)],
                ephemeral: true
            });
        }
    }
}; 