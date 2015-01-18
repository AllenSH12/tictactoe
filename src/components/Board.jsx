var React = require('react');

/**
* A Cell component, basically an HTML input that proxies clicks to
*/
var Cell = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    this.getDOMNode().blur();

    if (this.props.token !== '' && !this.props.gameOver) {
      this.props.onMessage('This cell has already been played.', true);

    } else if (!this.props.gameOver) {
      // this cell hasn't been played yet, click handler is in play...
      this.props.onClick(this.props.i);
    }
  },

  /**
   * dummy handler to prevent user input while the cpu is thinking
   */
  rejectClick: function(e) {
    e.preventDefault();
    this.getDOMNode().blur();
  },

  render: function() {
    var classString = !this.props.token ? 'cell' : 'cell played';
    var clickHandler = this.props.clickable ? this.handleClick : this.rejectClick;

    return (
      <input className={classString}
            onClick={clickHandler}
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
      moves: moves,
      clickable: true
    };
  },

  /**
  * Check if this cell has been played before otherwise play the cell and tell
  * the parent App of the new move (via this.props.onMove)
  * @param {Number} i the index of the cell that was clicked
  */
  handleClick: function(i) {
    this.setState({
      clickable: false
    });
    var newMove;

    this.playCell(i);

    // and tell the app we have a new move...
    newMove = this.getMove(i);
    this.props.onMove(newMove);
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

  render: function() {
    var cells = this.state.moves;

    return (
      <div className={this.props.blocking ? "gameBoard inactive" : "gameBoard"}>
        {cells.map(function(cell, i) {
          return (
            <Cell className='cell'
                  gameOver={this.props.gameOver}
                  onClick={this.handleClick}
                  clickable={this.state.clickable}
                  key={i}
                  i={i}
                  token={cell}
                  onMessage={this.props.onMessage}
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
