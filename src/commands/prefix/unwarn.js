const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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
    name: 'unwarn',
    description: 'Remove timeout from a user',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply({
                embeds: [createErrorEmbed('This command is only available to administrators!', message.client)]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply({
                embeds: [createErrorEmbed('I don\'t have permission to manage user timeouts!', message.client)]
            });
        }

        if (args.length < 1) {
            return message.reply({
                embeds: [createErrorEmbed('Please mention a user using @mention!', message.client)]
            });
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply({
                embeds: [createErrorEmbed('Please mention a user using @mention!', message.client)]
            });
        }

        if (!target.moderatable) {
            return message.reply({
                embeds: [createErrorEmbed('I cannot manage this user\'s timeout! They might have a higher role.', message.client)]
            });
        }

        if (!target.isCommunicationDisabled()) {
            return message.reply({
                embeds: [createErrorEmbed('This user is not currently timed out!', message.client)]
            });
        }

        try {
            await target.timeout(null);
            const successEmbed = createSuccessEmbed(
                `Timeout has been removed from ${target}`,
                message.client
            )
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setThumbnail(target.user.displayAvatarURL());

            await message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error while removing timeout:', error);
            await message.reply({
                embeds: [createErrorEmbed('An error occurred while removing the timeout!', message.client)]
            });
        }
    }
}; 