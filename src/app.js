var React = require('react');

var Game = require('./game.js');
var Player = require('./player.js');

/**
 * a Cell component
 */
var Cell = React.createClass({
  getInitialState: function() {
    return {
      token: ""
    };
  },

  handleClick: function(e) {
    e.preventDefault();
    this.getDOMNode().blur();

    debugger;

    if (!this.props.gameOver) {
      this.props.onClick(this.props.i);
    }
  },

  render: function() {
    return (
      <input className='cell' onClick={this.handleClick} value={this.state.token} readOnly={true}/>
    );
  }
});

var GameBoard = React.createClass({
  handleClick: function(i) {
    var size = 3;
    var x = Math.floor(i / size);
    var y = i % size;

    var newMove = {
      x: x,
      y: y
    };

    var refString = 'cell ' + i;
    var playedCell;

    if (this.moveAlreadyPlayed(newMove)) {
      this.props.onMessage('That cell has already been played.', true);
    } else if (!this.props.gameOver) {
      playedCell = this.refs[refString];
      playedCell.getDOMNode().classList.add('played');
      playedCell.setState({
        token: 'X'
      });
      this.props.onNewMove(newMove);
    }
  },

  /**
   * determine if a move has already been made
   * @param {Object} move   the move whose availability we'd like to check
   */
  moveAlreadyPlayed: function(move) {
    var gameData = this.props.gameData;
    var x = move.x;
    var y = move.y;

    return gameData[x] && gameData[x][y];
  },

  render: function() {
    var cells = [1,2,3,4,5,6,7,8,9];

    return (
      <div className="gameBoard">
        {cells.map(function(cell, i) {
          return (
            <Cell className='cell'
                  gameOver={this.props.gameOver}
                  onClick={this.handleClick}
                  key={i}
                  i={i}
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
      players: ['X', cpuPlayer],
      activePlayer: 0
    };
  },

  /**
   * update the game state w/ a user's latest move, this potentially includes
   * calling takeCpuTurn() to complete one 'tick' of the game state
   * @param {Object} newMove a generic object w/ the move to play (x & y coords as props)
   */
  playMove: function(newMove) {
    var game = this.state.game;

    // want to play the move so we can then ask the GameBoard if there are any winning moves...
    game.makeMove(newMove);

    var _this = this;

    if (game.isOver()) {
      // determine why the game ended (winning or full)
      this.endGame(game);
    } else {
      this.updateUI();
      document.getElementsByClassName('spinner')[0].classList.add('active');
      setTimeout(function() {
        _this.takeCpuTurn();
      }, 1000);
    }
  },

  /**
  * everything related to getting the computer player's move and progressing
  * the game as a result
  */
  takeCpuTurn: function() {
    // give cpu the board and get it's move in return
    var cpu = this.state.players[1];
    var game = this.state.game;
    var cpuMove = cpu.getMove(game);

    // play the move
    game.makeMove(cpuMove);

    var cellIndex = 3 * cpuMove.x + cpuMove.y;
    var refString = 'cell ' + cellIndex;
    var cellPlayed = this.refs.board.refs[refString];

    cellPlayed.getDOMNode().classList.add('played');
    cellPlayed.setState({
      token: 'O'
    });

    // if game over do stuff
    if (game.isOver()) {
      // determine why the game ended (winning or full)
      this.endGame(game);
    } else {
      this.updateUI();
    }
  },

  /**
  * clean up at the end of the game
  * @param {Game} game  the game to clean up after
  */
  endGame: function(game) {
    var bumpers;
    var i;
    var winningBumperString;
    var winningBumper;
    var msg;

    // save the final game state
    this.setState({
      game: game
    });

    // hide the spinner
    document.getElementsByClassName('spinner')[0].classList.remove('active');

    if (game.winner) {
      winningBumperString = game.winner === 'X' ? 'bumperLeft' : 'bumperRight';
      winningBumper = document.getElementsByClassName(winningBumperString)[0];
      winningBumper.classList.add('active');
      msg = game.winner + ' wins!';
    } else {
      // draw...
      bumpers = document.getElementsByClassName('bumper');
      for (i = 0; i < bumpers.length; i += 1) {
        bumpers[i].classList.add('active');
      }
      msg = 'The game was a draw.';
    }

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

  playCell: function() {

  },

  /**
  * make any UI changes that need to be made in between turns
  */
  updateUI: function() {
    this.setState({
      activePlayer: (this.state.activePlayer + 1) % 2
    });

    // if it was the cpu's turn and the thinking spinner was active disable it
    document.getElementsByClassName('spinner')[0].classList.remove('active');
  },

  render: function() {
    var activePlayer = this.state.activePlayer;
    var gameOver = this.state.game.isOver();

    return (
      <div className="app">
        <div className="player">
          <h3 className="playerName">Human</h3>
        </div>
        <div className="gameBoard">
          <div className={activePlayer === 0 ? 'bumper bumperLeft active' : 'bumper bumperLeft'}></div>
          <div id="board">
            <GameBoard ref={'board'}
                      onMessage={this.showMessage}
                      onNewMove={this.playMove}
                      gameData={this.state.game.data}
                      gameOver={gameOver}/>
          </div>
          <div className={activePlayer === 1 ? 'bumper bumperRight active' : 'bumper bumperRight'}></div>
        </div>
        <div className="player">
          <h3 className="playerName">Computer</h3>
          <div className="spinner">
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
