const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createErrorEmbed } = require('../../utils/embeds');

// Store active games
const activeGames = new Map();

function createGameEmbed(game, client) {
    const status = game.winner 
        ? `Winner: ${game.winner === 'X' ? '❌' : '⭕'}`
        : game.currentPlayer === 'X' 
            ? 'Current Turn: ❌'
            : 'Current Turn: ⭕';

    const timeLeft = game.turnEndTime 
        ? `\nTime left: ${Math.ceil((game.turnEndTime - Date.now()) / 1000)}s`
        : '';

    return new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🎮 Tic-Tac-Toe')
        .setDescription(
            `${status}${timeLeft}\n\n` +
            'Use the buttons below to make your move!'
        )
        .setFooter({ 
            text: 'Trixyma — Simple. Fast. Effective.',
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();
}

function createGameButtons(game) {
    const rows = [];
    for (let i = 0; i < 3; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 3; j++) {
            const index = i * 3 + j;
            const button = new ButtonBuilder()
                .setCustomId(`ttt_${index}`)
                .setLabel(game.board[index] || '•')
                .setStyle(game.board[index] ? ButtonStyle.Secondary : ButtonStyle.Primary)
                .setDisabled(game.board[index] !== null || game.winner !== null);
            row.addComponents(button);
        }
        rows.push(row);
    }

    // Add control buttons
    const controlRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ttt_reset')
                .setLabel('Reset Game')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false),
            new ButtonBuilder()
                .setCustomId('ttt_surrender')
                .setLabel('Surrender')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(game.winner !== null)
        );
    rows.push(controlRow);

    return rows;
}

function checkWinner(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (board.every(cell => cell !== null)) {
        return 'draw';
    }

    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Start a game of Tic-Tac-Toe')
        .addUserOption(option =>
            option.setName('opponent')
                .setDescription('The player to play against')
                .setRequired(true)),
    cooldown: 5,
    async execute(interaction, client) {
        const challenger = interaction.user;
        const opponent = interaction.options.getUser('opponent');

        if (opponent.bot) {
            return interaction.reply({
                embeds: [createErrorEmbed('You cannot play against a bot!', interaction.client)],
                ephemeral: true
            });
        }

        if (opponent.id === challenger.id) {
            return interaction.reply({
                embeds: [createErrorEmbed('You cannot play against yourself!', interaction.client)],
                ephemeral: true
            });
        }

        // Check if either player is already in a game
        if (activeGames.has(challenger.id) || activeGames.has(opponent.id)) {
            return interaction.reply({
                embeds: [createErrorEmbed('One of the players is already in a game!', interaction.client)],
                ephemeral: true
            });
        }

        const game = {
            board: Array(9).fill(null),
            players: [challenger.id, opponent.id],
            currentPlayer: 'X',
            winner: null,
            turnEndTime: Date.now() + 30000 // 30 seconds per turn
        };

        activeGames.set(challenger.id, game);
        activeGames.set(opponent.id, game);

        const gameEmbed = createGameEmbed(game, client);
        const buttons = createGameButtons(game);

        const gameMessage = await interaction.reply({
            embeds: [gameEmbed],
            components: buttons,
            fetchReply: true
        });

        const collector = gameMessage.createMessageComponentCollector({
            time: 300000 // 5 minutes total game time
        });

        // Start turn timer
        const turnTimer = setInterval(async () => {
            if (!activeGames.has(game.players[0])) {
                clearInterval(turnTimer);
                return;
            }

            if (Date.now() >= game.turnEndTime && !game.winner) {
                // Time's up - switch players
                game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
                game.turnEndTime = Date.now() + 30000;
                await gameMessage.edit({
                    embeds: [createGameEmbed(game, client)],
                    components: createGameButtons(game)
                });
            }
        }, 1000);

        collector.on('collect', async (i) => {
            if (!game.players.includes(i.user.id)) {
                return i.reply({
                    content: 'This game is not for you!',
                    flags: [4096] // Ephemeral flag
                });
            }

            if (i.customId === 'ttt_reset') {
                if (i.user.id !== game.players[0] && i.user.id !== game.players[1]) {
                    return i.reply({
                        content: 'Only players can reset the game!',
                        flags: [4096] // Ephemeral flag
                    });
                }

                game.board = Array(9).fill(null);
                game.currentPlayer = 'X';
                game.winner = null;
                game.turnEndTime = Date.now() + 30000;
                activeGames.set(game.players[0], game);
                activeGames.set(game.players[1], game);
                return i.update({
                    embeds: [createGameEmbed(game, client)],
                    components: createGameButtons(game)
                });
            }

            if (i.user.id !== game.players[game.currentPlayer === 'X' ? 0 : 1]) {
                return i.reply({
                    content: 'It\'s not your turn!',
                    flags: [4096] // Ephemeral flag
                });
            }

            if (i.customId === 'ttt_surrender') {
                const winner = game.currentPlayer === 'X' ? 'O' : 'X';
                game.winner = winner;
                const surrenderEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Game Over')
                    .setDescription(`${i.user} surrendered the game!\nWinner: <@${game.players[winner === 'X' ? 0 : 1]}>`)
                    .setFooter({ 
                        text: 'Trixyma — Simple. Fast. Effective.',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setTimestamp();

                activeGames.delete(game.players[0]);
                activeGames.delete(game.players[1]);
                collector.stop();
                clearInterval(turnTimer);
                return i.update({
                    embeds: [surrenderEmbed],
                    components: createGameButtons(game)
                });
            }

            const index = parseInt(i.customId.split('_')[1]);
            if (game.board[index] !== null) {
                return i.reply({
                    content: 'This cell is already taken!',
                    flags: [4096] // Ephemeral flag
                });
            }

            game.board[index] = game.currentPlayer;
            game.winner = checkWinner(game.board);

            if (game.winner) {
                const resultEmbed = new EmbedBuilder()
                    .setColor('#9B59B6')
                    .setTitle('Game Over')
                    .setDescription(
                        game.winner === 'draw'
                            ? 'The game ended in a draw!'
                            : `Winner: <@${game.players[game.winner === 'X' ? 0 : 1]}>`
                    )
                    .setFooter({ 
                        text: 'Trixyma — Simple. Fast. Effective.',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setTimestamp();

                activeGames.delete(game.players[0]);
                activeGames.delete(game.players[1]);
                collector.stop();
                clearInterval(turnTimer);
                return i.update({
                    embeds: [resultEmbed],
                    components: createGameButtons(game)
                });
            }

            game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
            game.turnEndTime = Date.now() + 30000;
            await i.update({
                embeds: [createGameEmbed(game, client)],
                components: createGameButtons(game)
            });
        });

        collector.on('end', () => {
            if (activeGames.has(game.players[0])) {
                activeGames.delete(game.players[0]);
                activeGames.delete(game.players[1]);
                clearInterval(turnTimer);
                gameMessage.edit({
                    components: []
                }).catch(() => {});
            }
        });
    }
}; 