const { EmbedBuilder } = require('discord.js');
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
            '**Your guess:** ' + (number ? number : 'Not guessed yet') + '\n\n' +
            'Use `t!guess <number>` to make a guess!'
        )
        .setFooter({ 
            text: 'Trixyma — Simple. Fast. Effective.',
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();
}

module.exports = {
    name: 'guess',
    description: 'Start a number guessing game',
    cooldown: 5,
    async execute(message, args, client) {
        // Check if user already has an active game
        if (activeGames.has(message.author.id)) {
            const game = activeGames.get(message.author.id);
            
            // If args provided, treat as a guess
            if (args.length > 0) {
                const guess = parseInt(args[0]);
                
                if (isNaN(guess) || guess < 1 || guess > 100) {
                    return message.reply({
                        embeds: [createErrorEmbed('Please provide a valid number between 1 and 100!', client)]
                    });
                }

                game.attempts++;
                game.currentGuess = guess;

                if (guess === game.targetNumber) {
                    const winEmbed = new EmbedBuilder()
                        .setColor('#9B59B6')
                        .setTitle('🎉 You Won!')
                        .setDescription(
                            `Congratulations! You guessed the number **${game.targetNumber}**!\n\n` +
                            `**Attempts used:** ${game.attempts}\n` +
                            `**Max attempts:** ${game.maxAttempts}`
                        )
                        .setFooter({ 
                            text: 'Trixyma — Simple. Fast. Effective.',
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setTimestamp();

                    activeGames.delete(message.author.id);
                    return message.reply({ embeds: [winEmbed] });
                }

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
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setTimestamp();

                    activeGames.delete(message.author.id);
                    return message.reply({ embeds: [loseEmbed] });
                }

                const hint = guess < game.targetNumber ? 'higher' : 'lower';
                const updatedEmbed = createGameEmbed(guess, game.attempts, game.maxAttempts, client)
                    .setDescription(
                        'I\'m thinking of a number between **1** and **100**!\n\n' +
                        '**Attempts left:** ' + (game.maxAttempts - game.attempts) + '\n' +
                        '**Your guess:** ' + guess + '\n' +
                        '**Hint:** The number is ' + hint + '!\n\n' +
                        'Use `t!guess <number>` to make another guess!'
                    );

                return message.reply({ embeds: [updatedEmbed] });
            }

            // If no args, show current game status
            return message.reply({
                embeds: [createGameEmbed(game.currentGuess, game.attempts, game.maxAttempts, client)]
            });
        }

        // Start new game
        const targetNumber = Math.floor(Math.random() * 100) + 1;
        const maxAttempts = 10;
        let attempts = 0;
        let currentGuess = null;

        // Store game data
        activeGames.set(message.author.id, {
            targetNumber,
            attempts,
            maxAttempts,
            currentGuess
        });

        const gameEmbed = createGameEmbed(currentGuess, attempts, maxAttempts, client);
        await message.reply({ embeds: [gameEmbed] });
    }
}; 