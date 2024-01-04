// ****************************************
//  Game Logic
// ****************************************
const GameBoard = (function (){
    let board = [
        ['_','_','_'],
        ['_','_','_'],
        ['_','_','_']
    ];
    const printBoard = () => {board.forEach(row => console.log(row))}
    return { board, printBoard};
})();

const Player = function (symbol,turn,bot){
    this.symbol = symbol;
    this.turn = turn;
    this.bot = bot
}



// ****************************************
//  View Controller
// ****************************************

let player1;
let player2;

const ViewController = (function (){

    // Screen variables
    const gameIntroScreen = document.querySelector('.home-start');
    const playerSelectionScreen = document.querySelector('.player-selection');
    const playerStartScreen = document.querySelector('.player-start');
    const gameScreen = document.querySelector('.home-game');

    // Button variables
    const playerVComp = document.querySelector('.pvc-btn');
    const playerVPlayer = document.querySelector('.pvp-btn');
    const playerChoiceX = document.querySelector('.choice-x');
    const playerChoiceO = document.querySelector('.choice-o');
    const startPlayerX= document.querySelector('.start-x');
    const startPlayerO= document.querySelector('.start-o');

    // Label variables

    const playerTurnLbl = document.querySelector('.player-turn');
    const timerLbl = document.querySelector('.timer-lbl')

    // Gameboard grid choices

    const gameGrid = document.querySelectorAll('.grid-box');
    

    // Variables that will be used to create Player objects
    let botSelected;
    let playerChoice;

    // First Screen to select who to go against
    playerVComp.addEventListener('click', e => {
        botSelected = true;
        gameIntroScreen.classList.toggle('active')
        playerSelectionScreen.classList.toggle('active')
    })
    playerVPlayer.addEventListener('click', e => {
        botSelected = false;
        gameIntroScreen.classList.toggle('active')
        playerStartScreen.classList.toggle('active')
    })

    // Second Screem to select what player symbol you want or who to start first

    playerChoiceX.addEventListener('click', e => {
        playerChoice = "X"
        playerSelectionScreen.classList.toggle('active')
        playerStartScreen.classList.toggle('active')
    })

    playerChoiceO.addEventListener('click', e => {
        playerChoice = "O"
        playerSelectionScreen.classList.toggle('active')
        playerStartScreen.classList.toggle('active')
    })
    
    const playerCreation = function(player) {

        let oppositePlayer = player === "X" ? "O" : "X"

        if(botSelected) {
            if(playerChoice === player) {
                player1 = new Player(playerChoice, true, false)
                player2 = new Player(oppositePlayer, false, true)
            } else {
                player1 = new Player(playerChoice, false, false)
                player2 = new Player(player, true, true)
            }

        }
        else {
            player1 = new Player("X", player === "X", false)
            player2 = new Player("O", player === "O", false)
        }

     }

     const botMovesFirst = function () {   
        if(player2.bot) {
            let oppMove = GameController.findBestMove()
            GameBoard.board[oppMove[0]][oppMove[1]] = player2.symbol
            let move;
            gameGrid.forEach(gridBox => {
                if(Number(gridBox.getAttribute('data-row')) === oppMove[0] && Number(gridBox.getAttribute('data-col')) === oppMove[1]){
                    move = gridBox
                }
            })
            move.classList.toggle(`${player2.symbol}Choice`);
            switchPlayer()
        }
     }

    startPlayerX.addEventListener('click', e => {
        playerCreation("X")
        playerStartScreen.classList.toggle('active')
        gameScreen.classList.toggle('active')
        botMovesFirst()
        startTimer()

    })

    startPlayerO.addEventListener('click', e => {
        playerCreation("O")
        playerStartScreen.classList.toggle('active')
        gameScreen.classList.toggle('active')
        botMovesFirst()
        startTimer()
    })

    const evalAndDisplay = function() {
        let score = GameController.evaluation()

        if(score === 10){
            console.log(`Player ${player1.symbol} wins!`)
            playerTurnLbl.innerText = `${player1.symbol} Wins!`
        }
        else if(score === -10) {
            console.log(`Player ${player2.symbol} wins!`)
            playerTurnLbl.innerText = `${player2.symbol} Wins!`
        }

        else if(!GameController.isMovesLeft()){
            console.log('The game is a draw!!!')
            playerTurnLbl.innerText = "Draw!!!"
        }

        return score
    }

    const gameOver = function() {
        gameGrid.forEach(box => {
            box.classList.add('game-end')
        })
        clearInterval(timer);
        remainingTime = 10;
        timerLbl.innerText = '10';
    }


    let timer;
    let remainingTime = 10;

    const startTimer = function() {

        if (player1.turn) {
            playerTurnLbl.innerText = `Player ${player1.symbol}'s Turn`;
        } else {
            playerTurnLbl.innerText = `Player ${player2.symbol}'s Turn`;
        }

        if(player2.bot){

        }

        timer = setInterval(() => {
            remainingTime -= 1;
            timerLbl.innerText = `${remainingTime}`;

            if (remainingTime <= 0) {
                switchPlayer();
            }
        }, 1000);
    }

    gameGrid.forEach(box => box.addEventListener('click', _ => {

        let choiceRow = box.getAttribute('data-row');
        let choiceCol = box.getAttribute('data-col');

        if(player1.turn) {
            if(GameBoard.board[choiceRow][choiceCol] !== '_') {
                return
            }

            GameBoard.board[choiceRow][choiceCol] = player1.symbol;
            box.classList.toggle(`${player1.symbol}Choice`);

            if(evalAndDisplay() === 10) {
                gameOver()
                return
            }

            if(!GameController.isMovesLeft()){
                gameOver()
                evalAndDisplay()
                return
            }

            switchPlayer()
            startTimer()

        } else if(player2.turn && !player2.bot){
            if(GameBoard.board[choiceRow][choiceCol] !== '_') {
                return
            }
            GameBoard.board[choiceRow][choiceCol] = player2.symbol
            box.classList.toggle(`${player2.symbol}Choice`);

            if(evalAndDisplay() === -10) {
                gameOver()
                return
            }

            if(!GameController.isMovesLeft()){
                gameOver()
                return
            }
            switchPlayer()
            startTimer()
        }

        if(player1.bot || player2.bot) {
            if(!GameController.isMovesLeft()){
                gameOver()
                return
            }

            let oppMove = GameController.findBestMove()
            GameBoard.board[oppMove[0]][oppMove[1]] = player2.symbol
            let move;
            gameGrid.forEach(gridBox => {
                if(Number(gridBox.getAttribute('data-row')) === oppMove[0] && Number(gridBox.getAttribute('data-col')) === oppMove[1]){
                    move = gridBox
                }
            })

            move.classList.toggle(`${player2.symbol}Choice`);

            if(evalAndDisplay() === -10) {
                gameOver()
                return
            }

            if(!GameController.isMovesLeft()){
                gameOver()
                evalAndDisplay()
                return
            }
            switchPlayer()
            startTimer()
        }
    }))

    const switchPlayer = () => {
        clearInterval(timer);
        remainingTime = 10;
        timerLbl.innerText = '10';
        player1.turn = !player1.turn;
        player2.turn = !player2.turn;
        if (player1.turn) {
            playerTurnLbl.innerText = `Player ${player1.symbol}'s Turn`;
        } else {
            playerTurnLbl.innerText = `Player ${player2.symbol}'s Turn`;
        }
    };

})();


// ****************************************
//  Game Controller
// ****************************************

const GameController = (function (board){
    
    const isMovesLeft = () => {
        for(let i = 0; i < 3; i++){
            for(j = 0; j < 3; j++){
                if(board[i][j] === '_'){
                    return true;
                }
            }
        }
        return false
    }

    const evaluation = () => {

        // Victory by row
        for(let row = 0; row < 3; row++){
            if(board[row][0] === board[row][1] && board[row][1] === board[row][2]){
                if(board[row][0] === player1.symbol){
                    return +10;
                }
                else if(board[row][0] === player2.symbol){
                    return -10;
                }
            }
        }

        // Victory by column
        for(let col = 0; col < 3; col++){
            if(board[0][col] === board[1][col] && board[1][col] === board[2][col]){
                if(board[0][col] === player1.symbol){
                    return +10
                }
                else if(board[0][col] === player2.symbol){
                    return -10
                }
            }
        }

        // Victory by leftmost diagonal
        if(board[0][0] === board[1][1] && board[1][1] === board[2][2]){
            if(board[0][0] === player1.symbol){
                return +10
            }
            else if(board[0][0] === player2.symbol){
                return -10
            }
        }

        // Victory by rightmost diagonal
        if(board[0][2] === board[1][1] && board[1][1] === board[2][0]){
            if(board[0][2] === player1.symbol){
                return +10
            }
            else if(board[0][2] === player2.symbol){
                return -10
            }
        }

        // Nobody Won 
        return 0;
    }

    const minimax = (depth, isMax) => {

        let score = evaluation()

        if(score === 10){
            return score - depth;
        }
        
        if(score === -10){
            return score + depth;
        }

        if(isMovesLeft() === false){
            return 0;
        }

        if(isMax){
            let best = -1000;

            for(let i = 0; i < 3; i++){
                for(let j = 0; j < 3; j++){
                    if(board[i][j] === '_'){
                        board[i][j] = player1.symbol;

                        best = Math.max(best, minimax(depth + 1, !isMax));
                        board[i][j] = '_';
                    }
                }
            }
            return best;
        }
        else {
            let best = 1000;

            for(let i = 0; i < 3; i++){
                for(let j = 0; j < 3; j++){
                    if(board[i][j] === '_'){
                        board[i][j] = player2.symbol;

                        best = Math.min(best, minimax(depth+1, !isMax));
                        board[i][j] = '_';
                    }
                }
            }
            return best;
        }
    }

    const findBestMove = () => {
        let best = -1000;
        let bestRow = -1
        let bestCol = -1

        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                if(board[i][j] === '_'){
                    board[i][j] = player1.symbol;

                    let move = minimax(0, false);

                    board[i][j] = '_';

                    if(move > best){
                        bestRow = i;
                        bestCol = j;
                        best = move;
                    }
                }
            }
        }
        bestMove = [bestRow,bestCol]
        return bestMove
    }

    const playGame = () => {
        console.log('Welcome to Tic Tac Toe')

        if(player1.bot || player2.bot){

            while(true){
                GameBoard.printBoard()

                let score = evaluation()

                if(score === 10){
                    console.log(`Player ${player1.symbol} wins!`)
                    break;
                }
                if(score === -10){
                    console.log(`Player ${player2.symbol} wins!`)
                    break;
                }
                if(!isMovesLeft()){
                    console.log('The game is a draw!!!')
                    break;
                }

                if (player1.turn == true){
                    let move = prompt(`Make your move Player ${player1.symbol}: `)
                    console.log(`Make your move Player ${player1.symbol}: `)
                    move = move.split('')
                    
                    if(board[move[0]][[move[1]]] !== '_'){
                        while(true){
                            move = prompt('Invalid Move. Make another choice: ')
                            console.log('Invalid Move. Make another choice: ')
                            
                            move = move.split('')
                            if(board[move[0]][[move[1]]] === '_') {
                                break
                            }
                        }
                    }

                    board[move[0]][[move[1]]] = player1.symbol
                    player1.turn = false
                    player2.turn = true

                } else {
                    console.log(`Make your move Player ${player2.symbol}: `)
                    let oppMove = findBestMove()
                    board[oppMove[0]][oppMove[1]] = player2.symbol
                    player1.turn = true
                    player2.turn = false

                }
            }
            

        } else {
            pass
        }
    }


    return {evaluation,findBestMove,isMovesLeft};
})(GameBoard.board);











