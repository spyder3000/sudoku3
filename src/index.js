import SudokuWin from "./sudokuMT16";
// import getPuzzle from './requests'

/*   Global variables section  */
var ui = {};
var grid = null;
var grid0 = null;
var grid20 = null;
var grid40 = null;
var grid60 = null;
var tmpgrid = [];
//    var unsolved = 81;
var puzzleSolved = 0;
var puzzleFail = 0;
var puzzleEntry = 0; // indicates this is a user-entered puzzle
var puzzleValid = 1; // puzzle setup is valid indicator
var deadend = 0; // value of 1 indicates that the incremental solve cannot be continued

// const puzzleEl = document.querySelector('#puzzle')
// const guessesEl = document.querySelector('#guesses')
let game1;

// const render = () => {
//     puzzleEl.innerHTML = ''
// //    puzzleEl.textContent = game1.puzzle
//     guessesEl.textContent = game1.statusMessage // remainingGuesses
//     game1.puzzle.split('').forEach((letter) => {
//         const letterEl = document.createElement('span')
//         letterEl.textContent = letter
//         puzzleEl.appendChild(letterEl)
//     })
// }

const startGame = async () => {
	console.log("start game");
	game1 = new SudokuWin({ title: "Sudoku Solver" });
	// render()

	//  document.querySelector('#user_guess').value ='';
	//  document.querySelector('#user_guess').focus();
};

// document.querySelector('#reset').addEventListener('click', startGame)   // referencing startGame is same as () => {startGame()}
//document.querySelector('#user_guess').addEventListener('change', () => {
//    window.alert('adadf');
//    document.querySelector('#user_guess').value ='';
//})

startGame();
