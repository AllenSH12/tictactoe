function Player(token) {
  var opponent = (token === 'X') ? 'O' : 'X';

  this.token = token;

  /**
   * ask the computer for it's move
   * @param {Game} game   the game for which the cpu needs to pick a move
   */
  this.getMove = function(game) {
    minimax(game);

    return this.move;
  }.bind(this);

  /**
   * find out the score for a given game
   * @param  {Game} game   a game state to score
   * @return {Number}      a score for this game's end state, as seen by this player
   */
  var score = function(game) {
    if (game.isWinner(this.token)) {
      return 10;
    } else if (game.isWinner(opponent)) {
      return -10;
    } else {
      return 0;
    }
  }.bind(this);

  /**
   * figure out what move to make
   * @param  {Object} game  the data representing a game board
   * @return {Number}       the score for a given game tree
   */
  var minimax = function(game) {
    if (game.isOver()) return score(game);
    var scores = [];
    var moves = [];

    var possibleMoves = game.getAvailableMoves();
    possibleMoves.forEach(function(move) {
      possibleGame = game.getNextState(move);
      scores.push(minimax(possibleGame));
      moves.push(move);
    });

    var maxScore;
    var maxIndex;
    var minScore;
    var minIndex;

    if (game.activePlayer() === this.token) {
      maxScore = scores.reduce(function(prev, curr) {
        return curr > prev ? curr : prev;
      });

      maxIndex = scores.indexOf(maxScore);

      this.move = moves[maxIndex];

      return scores[maxIndex];
    } else {
      minScore = scores.reduce(function(prev, curr) {
        return curr < prev ? curr : prev;
      });

      minIndex = scores.indexOf(minScore);

      this.move = moves[minIndex];

      return scores[minIndex];
    }
  }.bind(this);
}

module.exports = Player;
