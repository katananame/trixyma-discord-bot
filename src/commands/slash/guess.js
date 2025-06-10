const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createErrorEmbed } = require('../../utils/embeds');

// Store active games
const activeGames = new Map();

function createGameEmbed(number, attempts, maxAttempts, client) {
    return new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🎮 Number Guessing Game')
        .setDescription(
            'I\'m thinking of a number between **1** and **100**!\n\n' +
            '**Attempts left:** ' + (maxAttempts - attempts) + '\n' +
            '**Your guess:** ' + (number ? number : 'Not guessed yet')
        )
        .setFooter({ 
            text: 'Trixyma — Simple. Fast. Effective.',
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();
}

function createGameButtons() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('guess_higher')
                .setLabel('Higher ⬆️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('guess_lower')
                .setLabel('Lower ⬇️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('guess_correct')
                .setLabel('Correct! ✅')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('guess_giveup')
                .setLabel('Give Up ❌')
                .setStyle(ButtonStyle.Danger)
        );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Start a number guessing game'),
    cooldown: 5,
    async execute(interaction) {
        // Check if user already has an active game
        if (activeGames.has(interaction.user.id)) {
            return interaction.reply({
                embeds: [createErrorEmbed('You already have an active game! Finish it first.', interaction.client)],
                ephemeral: true
            });
        }

        const targetNumber = Math.floor(Math.random() * 100) + 1;
        const maxAttempts = 10;
        let attempts = 0;
        let currentGuess = null;

        // Store game data
        activeGames.set(interaction.user.id, {
            targetNumber,
            attempts,
            maxAttempts,
            currentGuess
        });

        const gameEmbed = createGameEmbed(currentGuess, attempts, maxAttempts, interaction.client);
        const buttons = createGameButtons();

        const gameMessage = await interaction.reply({
            embeds: [gameEmbed],
            components: [buttons],
            fetchReply: true
        });

        const collector = gameMessage.createMessageComponentCollector({
            time: 300000 // 5 minutes
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'This game is not for you!',
                    ephemeral: true
                });
            }

            const game = activeGames.get(interaction.user.id);
            if (!game) {
                return i.reply({
                    content: 'Game not found!',
                    ephemeral: true
                });
            }

            let newGuess;
            switch (i.customId) {
                case 'guess_higher':
                    newGuess = game.currentGuess ? Math.min(100, game.currentGuess + 10) : 50;
                    break;
                case 'guess_lower':
                    newGuess = game.currentGuess ? Math.max(1, game.currentGuess - 10) : 50;
                    break;
                case 'guess_correct':
                    if (game.currentGuess === game.targetNumber) {
                        const winEmbed = new EmbedBuilder()
                            .setColor('#9B59B6')
                            .setTitle('🎉 You Won!')
                            .setDescription(
                                `Congratulations! You guessed the number **${game.targetNumber}**!\n\n` +
                                `**Attempts used:** ${game.attempts + 1}\n` +
                                `**Max attempts:** ${game.maxAttempts}`
                            )
                            .setFooter({ 
                                text: 'Trixyma — Simple. Fast. Effective.',
                                iconURL: interaction.client.user.displayAvatarURL()
                            })
                            .setTimestamp();

                        activeGames.delete(interaction.user.id);
                        collector.stop();
                        return i.update({ embeds: [winEmbed], components: [] });
                    } else {
                        return i.reply({
                            content: 'That\'s not the correct number!',
                            ephemeral: true
                        });
                    }
                case 'guess_giveup':
                    const giveupEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Game Over')
                        .setDescription(
                            `You gave up! The number was **${game.targetNumber}**.\n\n` +
                            `**Attempts made:** ${game.attempts}\n` +
                            `**Max attempts:** ${game.maxAttempts}`
                        )
                        .setFooter({ 
                            text: 'Trixyma — Simple. Fast. Effective.',
                            iconURL: interaction.client.user.displayAvatarURL()
                        })
                        .setTimestamp();

                    activeGames.delete(interaction.user.id);
                    collector.stop();
                    return i.update({ embeds: [giveupEmbed], components: [] });
            }

            game.currentGuess = newGuess;
            game.attempts++;

            if (game.attempts >= game.maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Game Over')
                    .setDescription(
                        `You ran out of attempts! The number was **${game.targetNumber}**.\n\n` +
                        `**Attempts made:** ${game.attempts}\n` +
                        `**Max attempts:** ${game.maxAttempts}`
                    )
                    .setFooter({ 
                        text: 'Trixyma — Simple. Fast. Effective.',
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                    .setTimestamp();

                activeGames.delete(interaction.user.id);
                collector.stop();
                return i.update({ embeds: [loseEmbed], components: [] });
            }

            const updatedEmbed = createGameEmbed(game.currentGuess, game.attempts, game.maxAttempts, interaction.client);
            await i.update({ embeds: [updatedEmbed], components: [buttons] });
        });

        collector.on('end', () => {
            if (activeGames.has(interaction.user.id)) {
                activeGames.delete(interaction.user.id);
                interaction.editReply({
                    components: []
                }).catch(() => {});
            }
        });
    }
}; 