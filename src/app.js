var React = require('react');

var Game = require('./game.js');
var Player = require('./player.js');

/**
 * a Cell component
 */
var Cell = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    this.getDOMNode().blur();

    if (!this.props.gameOver) {
      this.props.onClick(this.props.i);
    }
  },

  render: function() {
    var classString = !this.props.token ? 'cell' : 'cell played';

    return (
      <input className={classString} onClick={this.handleClick} value={this.props.token} readOnly={true}/>
    );
  }
});

/**
 * the tic-tac-toe game's UI
 */
var Board = React.createClass({
  getInitialState: function() {
    var numMoves = Math.pow(this.props.size, 2);
    var moves = [];

    for (var i = 0; i < numMoves; i += 1) {
      moves.push('');
    }

    return {
      moves: moves
    };
  },

  /**
   * check if this cell has been played before
   * @param {Number} i the index of the cell that was clicked
   */
  handleClick: function(i) {
    var newMove;

    if (this.cellAlreadyPlayed(i)) {
      // reject...
      this.props.onMessage('That cell has already been played.', true);
    } else {
      this.playCell(i);
      newMove = this.getMove(i);
      // and tell the app we have a new move...
      this.props.onMove(newMove);
    }
  },

  /**
   * get a move object to pass to other parts of the app from the cell index
   * @param {Number} i the index of the cell for which we want an x/y coordinate object
   */
  getMove: function(i) {
    var size = this.props.size;

    return {
      x: Math.floor(i / size),
      y: i % size
    };
  },

  /**
   * store the new move and show the results of playing this cell in the UI
   * @param {Number} i the index of the cell to activate
   */
  playCell: function(i) {
    var moves = this.state.moves.slice();
    moves[i] = this.props.activeToken;

    this.setState({
      moves: moves
    });
  },

  /**
   * see if a cell has already been played
   * @param {Number} i index of a cell the user wants to play
   */
  cellAlreadyPlayed: function(i) {
    return this.state.moves.indexOf(i) >= 0;
  },

  render: function() {
    var cells = this.state.moves;

    return (
      <div className="gameBoard">
        {cells.map(function(cell, i) {
          return (
            <Cell className='cell'
                  gameOver={this.props.gameOver}
                  onClick={this.handleClick}
                  key={i}
                  i={i}
                  token={cell}
                  ref={'cell ' + i}/>
          );
        }, this)}
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    var game = new Game();
    var cpuPlayer = new Player('O');

    return {
      game: game,
      players: ['X', cpuPlayer]
    };
  },

  /**
   * update the game state w/ the newest move, if the cpu is active after the new
   * move get it's choice of move and keep the game moving
   * @param {Object} newMove a generic object w/ the move to play (x & y coords as props)
   */
  playMove: function(newMove) {
    var game = this.state.game;

    // want to play the move so we can then ask the GameBoard if there are any winning moves...
    game.makeMove(newMove);

    this.setState({
      game: game
    });

    var _this = this;

    if (game.isOver()) {
      // determine why the game ended (winning or full)
      this.endGame(game);
    } else if (game.activePlayer() === 'O') {
      // it's the cpu's turn...
      setTimeout(function() {
        var cpu = _this.state.players[1];
        var cpuMove = cpu.getMove(game);

        _this.playMove(cpuMove);

        // figure out which cell this move belongs to and mark it in a copy
        // of the playedMoves from the board ref
        var cellIndex = 3 * cpuMove.x + cpuMove.y;
        var playedMoves = _this.refs.board.state.moves.slice();
        playedMoves[cellIndex] = 'O';

        // upate the board refs state so the UI re-draws
        _this.refs.board.setState({
          moves: playedMoves
        });
      }, 1000);
    }
  },

  /**
  * clean up at the end of the game
  * @param {Game} game  the game to clean up after
  */
  endGame: function(game) {
    var msg = game.winner ? game.winner + ' wins!' : 'The game was a draw.';

    this.showMessage(msg, false);
  },

  /**
  * alert the user to some message
  */
  showMessage: function(msg, hideAfter) {
    var alertNode = document.getElementById('alert');

    alertNode.innerHTML = msg;
    alertNode.className += ' visible';

    if (hideAfter) {
      setTimeout(function() {
        alertNode.className = '';
      }, 1000);
    }
  },

  render: function() {
    var activePlayer = this.state.game.activePlayer();
    var gameOver = this.state.game.isOver();
    var winner = this.state.game.winner;
    var tieGame = gameOver && !winner;

    var lBumperStr = 'bumper bumperLeft';
    var rBumperStr = 'bumper bumperRight';
    var leftBumperClassString = activePlayer === 'X' ? lBumperStr + ' active' : lBumperStr;
    var rightBumperClassString = activePlayer === 'O' ? rBumperStr + ' active' : rBumperStr;
    var spinnerClassString = activePlayer === 'O' && !gameOver ? 'spinner active' : 'spinner';

    if (gameOver) {
      leftBumperClassString = winner === 'X' || tieGame ? lBumperStr + ' active' : lBumperStr;
      rightBumperClassString = winner === 'O' || tieGame ? rBumperStr + ' active' : rBumperStr;
    }

    return (
      <div className="app">
        <div className="player">
          <h3 className="playerName">Human</h3>
        </div>
        <div className="gameBoard">
          <div className={leftBumperClassString}></div>
          <div id="board">
            <Board ref={'board'}
                    size={this.state.game.size}
                    activeToken={activePlayer}
                    onMessage={this.showMessage}
                    onMove={this.playMove}
                    gameOver={gameOver}/>
          </div>
          <div className={rightBumperClassString}></div>
        </div>
        <div className="player">
          <h3 className="playerName">Computer</h3>
          <div className={spinnerClassString}>
            <div className="cube1"></div>
            <div className="cube2"></div>
          </div>
        </div>
        <p id="alert">That cell has already been played.</p>
      </div>
    );
  }
});

React.render(
  <App />,
  document.body
);
