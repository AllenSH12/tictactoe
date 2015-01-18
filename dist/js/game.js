function Game(gameState) {
  this.data = gameState ? gameState.data : {};
  this.size = 3;
  this.players = ['X', 'O'];
  this.activePlayerIndex = gameState && gameState.active ? gameState.active : 0;

  /**
  * [makeMove description]
  * @param {[type]} newMove [description]
  */
  this.makeMove = function(newMove) {
    var activePlayer = this.activePlayer();

    // store the data... initializing a new row object if needed
    if (!this.data[newMove.x]) {
      this.data[newMove.x] = {};
    }
    this.data[newMove.x][newMove.y] = activePlayer;

    if (hasWinningChain()) {
      this.winner = activePlayer;
    }

    // change activePlayerIndex...
    this.activePlayerIndex = (this.activePlayerIndex + 1) % 2;
  }.bind(this);

  /**
  * return true if the game is over, with a winner or draw
  */
  this.isOver = function() {
    return hasWinningChain() || isBoardFull();
  };

  /**
  * return an array of moves, objects containing x, y coordinates of open cells
  */
  this.getAvailableMoves = function() {
    var i;
    var j;
    var moves = [];

    for (i = 0; i < this.size; i += 1) {
      row = this.data[i];
      for (j = 0; j < this.size; j += 1) {
        if (!row || !row[j]) {
          moves.push({
            x: i,
            y: j
          });
        }
      }
    }

    return moves;
  }.bind(this);

  /**
  * return a new Game instantiated w/ this game's current state (data & activePlayer)
  */
  this.getNextState = function(nextMove) {
    var clonedData = JSON.parse(JSON.stringify(this.data));

    var nextGame = new Game({
      data: clonedData,
      active: this.activePlayerIndex
    });

    nextGame.makeMove(nextMove);

    return nextGame;
  };

  /**
  * return the token representing the active player
  */
  this.activePlayer = function() {
    return this.players[this.activePlayerIndex];
  }.bind(this);

  /**
  * determine if a given player is the winner of this game
  * @param {String} player a player's token
  */
  this.isWinner = function(player) {
    if (!this.winner) return false;

    return this.winner === player;
  }.bind(this);

  /**
  * determine if all possible choices have been played
  */
  var isBoardFull = function() {
    var boardRows = Object.keys(this.data);
    var numRows = boardRows.length;

    var allRowsFull = function(rowIndices) {
      // since numRows === this.size rowIndices should always be [0, 1, 2]
      return rowIndices.every(function(i) {
        var row = this.data[i];
        return Object.keys(row).length === this.size;
      }, this);
    }.bind(this);

    return numRows === this.size && allRowsFull(boardRows);
  }.bind(this);

  /**
  * determine if this board contains any winning chains (row, col, or diagonal)
  */
  var hasWinningChain = function() {
    var hasWinChain = false;

    // check diagonals
    var diagonals = getDiagonals();
    diagonals.forEach(function(diagonal) {
      if (isWinningChain(diagonal)) hasWinChain = true;
    });

    // check rows & cols (if needed)
    var i;
    var row;
    var col;
    if (!hasWinChain) {
      for (i = 0; i < this.size; i += 1) {
        row = getRow(i);
        col = getCol(i);

        if (isWinningChain(row) || isWinningChain(col)) {
          hasWinChain = true;
          break;
        }
      }
    }

    return hasWinChain;
  }.bind(this);

  /**
  * get the chain at a given row index
  * @param {Integer} i the row you want to retrieve a chain for
  */
  var getRow = function(i) {
    var row = this.data[i];
    var rowArray = [];
    var j;

    if (typeof(row) !== null && typeof(row) === 'object') {
      for (j = 0; j < this.size; j += 1) {
        try {
          rowArray.push(row[j]);
        } catch (e) {
          // this cell hasn't been defined yet
          col.push(undefined);
        }
      }
    }

    return rowArray;
  }.bind(this);

  /**
  * get the chain at a given column index
  * @param {Integer} j the column you want to retrieve a chain for
  */
  var getCol = function(j) {
    var col = [];
    var i;

    for (i = 0; i < this.size; i += 1) {
      try {
        col.push(this.data[i][j]);
      } catch (e) {
        // this cell hasn't been defined yet
        col.push(undefined);
      }
    }

    return col;
  }.bind(this);

  /**
  * compute both of the diagonal chains (backslash - top left to bottom right &
  * fwdslash - top right to bottom left) and return them nested inside an outer array
  */
  var getDiagonals = function() {
    var diagonals = [];
    var backslash = [];
    var fwdslash = [];
    var i;

    for (i = 0; i < this.size; i += 1) {
      try {
        backslash.push(this.data[i][i]);
      } catch (e) {
        backslash.push(undefined);
      }
      try {
        fwdslash.push(this.data[i][this.size - (i + 1)]);
      } catch (e2) {
        fwdslash.push(undefined);
      }
    }

    diagonals.push(backslash);
    diagonals.push(fwdslash);

    return diagonals;
  }.bind(this);

  /**
  * determine if a given chain of entries constitutes a winning chain
  * @param {Array} chain an array containing the played (or not) values
  * for a given row, col, or diagonal
  */
  var isWinningChain = function(chain) {
    var isCorrectLength = chain.length === this.size;
    var hasValidFirstElement = chain[0] === 'X' || chain[0] === 'O';

    var allElementsAreSame = chain.every(function(entry) {
      return entry === chain[0];
    });

    return isCorrectLength && hasValidFirstElement && allElementsAreSame;
  }.bind(this);
}

module.exports = Game;
