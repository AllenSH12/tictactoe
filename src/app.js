var React = require('react');

var Game = require('./game.js');
var Player = require('./player.js');
var Board = require('./components/board.jsx');

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
        var cellIndex = game.size * cpuMove.x + cpuMove.y;
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
