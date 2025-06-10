const { EmbedBuilder } = require('discord.js');
const { createErrorEmbed } = require('../../utils/embeds');

module.exports = {
    name: 'random',
    description: 'Generate a random number',
    cooldown: 5, // 5 seconds cooldown
    async execute(message, args, client) {
        let min = 1;
        let max = 100;

        if (args.length > 0) {
            const numbers = args[0].split('-');
            if (numbers.length === 2) {
                min = parseInt(numbers[0]);
                max = parseInt(numbers[1]);
            } else {
                max = parseInt(args[0]);
            }
        }

        if (isNaN(min) || isNaN(max)) {
            return message.reply({
                embeds: [createErrorEmbed(
                    '**Invalid Input!**\n\n' +
                    '❌ Please provide valid numbers.\n\n' +
                    '📋 Usage: `t!random [min-max]` or `t!random [max]`\n' +
                    '💭 Examples: `t!random 1-100` or `t!random 50`',
                    client
                )]
            });
        }

        if (min >= max) {
            return message.reply({
                embeds: [createErrorEmbed('Minimum number must be less than maximum number!', client)]
            });
        }

        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        const randomEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎲 Random Number Generator')
            .setDescription(`Your random number between **${min}** and **${max}** is:\n\n**${randomNumber}**`)
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        await message.channel.send({ embeds: [randomEmbed] });
    }
}; 