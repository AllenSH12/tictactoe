var React = require('react');

/**
* A Cell component, basically an HTML input that proxies clicks to
*/
var Cell = React.createClass({
  handleClick: function(e) {
    e.preventDefault();

    if (!this.props.gameOver) {
      this.getDOMNode().blur();

      this.props.onClick(this.props.i);
    }
  },

  render: function() {
    var classString = !this.props.token ? 'cell' : 'cell played';

    return (
      <input className={classString}
            onClick={this.handleClick}
            value={this.props.token}
            readOnly={true}/>
    );
  }
});

/**
* The tic-tac-toe game's UI.
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
  * Check if this cell has been played before otherwise play the cell and tell
  * the parent App of the new move (via this.props.onMove)
  * @param {Number} i the index of the cell that was clicked
  */
  handleClick: function(i) {
    var newMove;

    if (this.cellAlreadyPlayed(i)) {
      // reject...
      this.props.onMessage('That cell has already been played.', true);
    } else if (this.props.blocking) {
      //
      console.log('cant play until cpu is done');
    } else {
      this.playCell(i);

      // and tell the app we have a new move...
      newMove = this.getMove(i);
      this.props.onMove(newMove);
    }
  },

  /**
  * Get a move object to pass to other parts of the app from the cell index
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
  * Store the new move to update cell UI
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
  * See if a cell has already been played
  * @param {Number} i index of a cell the user wants to play
  */
  cellAlreadyPlayed: function(i) {
    return this.state.moves[i] !== '';
  },

  render: function() {
    var cells = this.state.moves;

    return (
      <div className={this.props.blocking ? "gameBoard inactive" : "gameBoard"}>
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
        <div className={this.props.blocking ? 'spinner active' : 'spinner'}>
          <div className="cube1"></div>
          <div className="cube2"></div>
        </div>
      </div>
    );
  }
});

module.exports = Board;
