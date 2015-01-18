onmessage = function(e) {
  try {
    importScripts('./game.js');
  } catch (e) {
    console.log('TypeError importing of CommonJS style modules (Game), constructors should still work');
  }

  try {
    importScripts('./player.js');
  } catch (e2) {
    console.log('TypeError importing of CommonJS style modules (Player), constructors should still work');
  }

  var msg = e.data;

  if (msg.type && msg.type === 'setToken') {
    self.token = msg.data;

  } else if (msg.type && msg.type === 'newMove') {
    var game = new Game({ data: msg.data, active: 1 });
    var cpu = new Player(self.token);

    postMessage(cpu.getMove(game));
  }
}
