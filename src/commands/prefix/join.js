const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// Function to create error embed messages
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

// Function to create success embed messages
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
    name: 'join',
    description: 'Join your voice channel',
    async execute(message, args) {
        const member = message.member;

        // Check if user is in a voice channel
        if (!member.voice.channel) {
            return message.reply({
                embeds: [createErrorEmbed('You need to be in a voice channel first!', message.client)]
            });
        }

        try {
            // Join the voice channel using the correct method
            const connection = joinVoiceChannel({
                channelId: member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfMute: false
            });

            const successEmbed = createSuccessEmbed(
                `Joined voice channel: ${member.voice.channel.name}`,
                message.client
            )
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });

            await message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error joining voice channel:', error);
            await message.reply({
                embeds: [createErrorEmbed('Failed to join the voice channel!', message.client)]
            });
        }
    }
}; 