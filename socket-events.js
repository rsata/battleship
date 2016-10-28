module.exports = {

  sunk: function(socket, data) {
    socket.emit('sunk', data);
    socket.broadcast.emit('gotSunk', data);
  },

  hit: function(socket, data) {
    socket.emit('hit', data);
    socket.broadcast.emit('gotHit', data);
  },

  miss: function(socket, data) {
    socket.emit('miss', data);
    socket.broadcast.emit('gotMissed', data);
  },

  gameOver: function(socket, data) {
    socket.emit('youWin');
    socket.broadcast.emit('youLose');
  },
  
}