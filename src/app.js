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

        // execute this async so click events have a chance to get rejected
        setTimeout(function(){
          // upate the board refs state so the UI re-draws
          _this.refs.board.setState({
            clickable: true
          });
        }, 0);
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

    var moves = [];
    var row;
    var i;
    var j;

    for (i = 0; i < this.state.game.size; i++) {
      row = this.state.game.data[i];
      if (!row) {
        moves.push('', '', '');
      } else {
        for (j = 0; j < this.state.game.size; j++) {
          moves.push(row[j] ? row[j] : '');
        }
      }
    }

    var playerClass = 'player';
    var humanPlayerClass = (activePlayer === 'X') ? playerClass + ' active' : playerClass;
    var cpuPlayerClass = (activePlayer === 'O') ? playerClass + ' active' : playerClass;

    if (gameOver) {
      humanPlayerClass = (winner === 'X' || tieGame) ? playerClass + ' winner' : playerClass;
      cpuPlayerClass = (winner === 'O' || tieGame) ? playerClass + ' winner' : playerClass;
    }

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3 col-md-offset-3">
            <div className={humanPlayerClass}>
              <h4 className="playerTitle">Player - 'X'</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className={cpuPlayerClass}>
              <h4 className="playerTitle">Computer - 'O'</h4>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <div className="gameContainer">
              <Board ref={'board'}
                    size={this.state.game.size}
                    moves={moves}
                    activeToken={activePlayer}
                    onMessage={this.showMessage}
                    onMove={this.playMove}
                    gameOver={gameOver}/>
              <p id="alert">That cell has already been played.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

React.render(
  <App />,
  document.body
);
