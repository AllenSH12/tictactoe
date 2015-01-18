var React = require('react');

var Game = require('./game.js');
var Player = require('./player.js');
var Board = require('./components/board.jsx');

var App = React.createClass({
  getInitialState: function() {
    var game = new Game();

    // track playedMoves and players outside of state since they won't impact UI
    this.playedMoves = [];
    this.players = ['X', this.getNewPlayer('O')];

    return {
      game: game
    };
  },

  /**
   * update the game state w/ the newest move, if the cpu is active after the new
   * move get it's choice of move and keep the game moving
   * @param {Object} newMove a generic object w/ the move to play (x & y coords as props)
   */
  playMove: function(newMove, skipCpu) {
    var game = this.state.game;

    // play the move so we can ask the Game if there are any winning moves...
    game.makeMove(newMove);

    // update the App component's internal state
    this.playedMoves.push(newMove);
    this.setState({
      game: game
    });

    // figure out if this player is a computer (Worker) or human
    var activePlayer = this.players[this.state.game.activePlayerIndex];
    var playerIsCpu = activePlayer.toString() === "[object Worker]";

    if (game.isOver()) {
      this.endGame(game);
    } else if (playerIsCpu && !skipCpu) {
      activePlayer.postMessage({ type: 'newMove', data: game.data});
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

  /**
   * create a new Game and overwrite the game in state, resetting
   * the UI as a result
   * @param {Event} e click event
   */
  resetGame: function(e) {
    e.preventDefault();

    this.pendingReset = true;

    // reset any Worker players and replace each w/ a new Worker
    this.players = this.players.map(function(player) {
      if (player.toString() === "[object Worker]" ) {
        player.terminate();
        return this.getNewPlayer(player.token);
      } else {
        return player;
      }
    }, this);

    this.showMessage('', false);
    this.playedMoves = [];
    this.refs.board.setState({ clickable: true });

    var newGame = new Game();
    this.setState({
      game: newGame
    });
  },

  /**
   * show the user a replay of the last game
   * @param {Event} e a click event to ignore
   */
  replayGame: function(e) {
    var _this = this;
    var plays = this.playedMoves.slice();

    this.resetGame(e);

    plays.forEach(function(play, i) {
      var delay = i * 1000;

      setTimeout(function() {
        _this.playMove(play, true);
      }, delay);
    });
  },

  /**
   * create a new Worker for the App to use and assign the callback
   * to fire when it has a new move to play
   * @TODO fall back to a conventional Player?
   */
  getNewPlayer: function(token) {
    var worker;

    if (!!window.Worker) {
      worker = new Worker('./js/worker.js');

      worker.postMessage({ type: 'setToken', data: token });
      worker.token = token;

      worker.onmessage = function(e) {
        var _this = this;

        // delay so it seems like the cpu is thinking a bit :)
        setTimeout(function() {
          if (!_this.pendingReset) {
            _this.playMove(e.data);
            _this.refs.board.setState({
              clickable: true
            });
          } else {
            _this.pendingReset = false;
          }
        }, 1000);
      }.bind(this);
    }

    return worker;
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
              <p id="alert"></p>
            </div>
          </div>
        </div>
        <div className="row controls">
          <div className="col-md-3 col-md-offset-3">
            <button className="btn btn-default btn-block" onClick={this.resetGame}>Reset</button>
          </div>
          <div className="col-md-3">
            <button className="btn btn-default btn-block" onClick={this.replayGame} disabled={!gameOver}>Replay</button>
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
