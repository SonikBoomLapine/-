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
let score = { X: 0, O: 0, draws: 0 };

function updateTurnDisplay() {
  scoreXCard.classList.toggle('active', !roundOver && currentPlayer === 'X');
  scoreOCard.classList.toggle('active', !roundOver && currentPlayer === 'O');
}

function finishRound(message) {
  roundOver = true;
  statusText.textContent = message;
  cells.forEach((cell) => { cell.disabled = true; });
  updateTurnDisplay();
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);
  if (roundOver || board[index]) return;

  board[index] = currentPlayer;
  cell.textContent = currentPlayer === 'X' ? '×' : '○';
  cell.classList.add(currentPlayer === 'X' ? 'mark-x' : 'mark-o');
  cell.setAttribute('aria-label', `${cell.getAttribute('aria-label')}, ${currentPlayer === 'X' ? 'крестик' : 'нолик'}`);

  const winningLine = winningLines.find((line) => line.every((position) => board[position] === currentPlayer));
  if (winningLine) {
    winningLine.forEach((position) => cells[position].classList.add('winning-cell'));
    score[currentPlayer] += 1;
    renderScore();
    finishRound(`Победили ${currentPlayer === 'X' ? 'крестики' : 'нолики'}!`);
    return;
  }

  if (board.every(Boolean)) {
    score.draws += 1;
    renderScore();
    finishRound('Ничья! Хорошая игра.');
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = `Ходят ${currentPlayer === 'X' ? 'крестики' : 'нолики'}`;
  updateTurnDisplay();
}

function renderScore() {
  scoreXText.textContent = score.X;
  scoreOText.textContent = score.O;
  scoreDrawText.textContent = score.draws;
}

function startNewRound() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  roundOver = false;
  statusText.textContent = 'Ходят крестики';
  cells.forEach((cell, index) => {
    const row = Math.floor(index / 3) + 1;
    const column = (index % 3) + 1;
    cell.textContent = '';
    cell.disabled = false;
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
