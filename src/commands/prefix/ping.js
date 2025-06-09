const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Check bot latency',
    async execute(message, args) {
        const start = Date.now();
        const tempMsg = await message.reply('Measuring ping...');
        const latency = Date.now() - start;
        const apiPing = message.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'API Latency', value: `${apiPing}ms`, inline: true },
                { name: 'Bot Response', value: `${latency}ms`, inline: true }
            )
            .setFooter({ 
                text: 'Trixyma — Simple. Fast. Effective.',
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await tempMsg.edit({ content: '', embeds: [embed] });
    }
}; 