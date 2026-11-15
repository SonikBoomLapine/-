const cells = [...document.querySelectorAll('.cell')];
const statusText = document.querySelector('#status');
const scoreXText = document.querySelector('#score-x');
const scoreOText = document.querySelector('#score-o');
const scoreDrawText = document.querySelector('#score-draw');
const scoreXCard = document.querySelector('#score-x-card');
const scoreOCard = document.querySelector('#score-o-card');
const newGameButton = document.querySelector('#new-game');
const resetScoreButton = document.querySelector('#reset-score');

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let board = Array(9).fill('');
let currentPlayer = 'X';
let roundOver = false;
let botThinking = false;
let botTimer = null;
let score = { X: 0, O: 0, draws: 0 };

function updateTurnDisplay() {
  scoreXCard.classList.toggle('active', !roundOver && currentPlayer === 'X');
  scoreOCard.classList.toggle('active', !roundOver && currentPlayer === 'O');
  cells.forEach((cell, index) => {
    cell.disabled = roundOver || botThinking || Boolean(board[index]);
  });
}

function finishRound(message) {
  roundOver = true;
  botThinking = false;
  statusText.textContent = message;
  updateTurnDisplay();
}

function showMove(index, player) {
  const cell = cells[index];
  board[index] = player;
  cell.textContent = player === 'X' ? '×' : '○';
  cell.classList.add(player === 'X' ? 'mark-x' : 'mark-o');
  cell.setAttribute('aria-label', `${cell.getAttribute('aria-label')}, ${player === 'X' ? 'крестик' : 'нолик'}`);
  updateTurnDisplay();
}

function getWinningLine(position) {
  return winningLines.find((line) => line.every((index) => position[index] === position[line[0]]) && position[line[0]]);
}

function finishIfGameOver(player) {
  const winningLine = getWinningLine(board);
  if (winningLine) {
    winningLine.forEach((position) => cells[position].classList.add('winning-cell'));
    score[player] += 1;
    renderScore();
    finishRound(player === 'X' ? 'Вы победили!' : 'Робот победил!');
    return true;
  }

  if (board.every(Boolean)) {
    score.draws += 1;
    renderScore();
    finishRound('Ничья! Хорошая игра.');
    return true;
  }

  return false;
}

function minimax(position, maximizing, depth) {
  const winningLine = getWinningLine(position);
  if (winningLine) {
    const winner = position[winningLine[0]];
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
  }
  if (position.every(Boolean)) return 0;

  const player = maximizing ? 'O' : 'X';
  let bestScore = maximizing ? -Infinity : Infinity;
  for (let index = 0; index < position.length; index += 1) {
    if (position[index]) continue;
    position[index] = player;
    const scoreForMove = minimax(position, !maximizing, depth + 1);
    position[index] = '';
    bestScore = maximizing
      ? Math.max(bestScore, scoreForMove)
      : Math.min(bestScore, scoreForMove);
  }
  return bestScore;
}

function findBestBotMove() {
  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  let bestMove = null;
  let bestScore = -Infinity;

  moveOrder.forEach((index) => {
    if (board[index]) return;
    board[index] = 'O';
    const scoreForMove = minimax(board, false, 1);
    board[index] = '';
    if (scoreForMove > bestScore) {
      bestScore = scoreForMove;
      bestMove = index;
    }
  });
  return bestMove;
}

function makeBotMove() {
  botTimer = null;
  if (roundOver) return;

  const index = findBestBotMove();
  if (index === null) return;
  showMove(index, 'O');
  botThinking = false;
  if (finishIfGameOver('O')) return;

  currentPlayer = 'X';
  statusText.textContent = 'Ваш ход — крестики';
  updateTurnDisplay();
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);
  if (roundOver || botThinking || currentPlayer !== 'X' || board[index]) return;

  showMove(index, 'X');
  if (finishIfGameOver('X')) return;

  currentPlayer = 'O';
  botThinking = true;
  statusText.textContent = 'Робот думает…';
  updateTurnDisplay();
  botTimer = window.setTimeout(makeBotMove, 350);
}

function renderScore() {
  scoreXText.textContent = score.X;
  scoreOText.textContent = score.O;
  scoreDrawText.textContent = score.draws;
}

function startNewRound() {
  if (botTimer !== null) window.clearTimeout(botTimer);
  botTimer = null;
  board = Array(9).fill('');
  currentPlayer = 'X';
  roundOver = false;
  botThinking = false;
  statusText.textContent = 'Ваш ход — крестики';
  cells.forEach((cell, index) => {
    const row = Math.floor(index / 3) + 1;
    const column = (index % 3) + 1;
    cell.textContent = '';
    cell.className = 'cell';
    cell.setAttribute('aria-label', `Строка ${row}, столбец ${column}`);
  });
  updateTurnDisplay();
}

function resetScore() {
  score = { X: 0, O: 0, draws: 0 };
  renderScore();
  startNewRound();
}

cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
newGameButton.addEventListener('click', startNewRound);
resetScoreButton.addEventListener('click', resetScore);
updateTurnDisplay();
