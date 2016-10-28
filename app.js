var express = require('express');
var app = express();
var path = require('path');
var $ = require('jquery');
var port = 3000;

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var check = require('./check');
var sio = require('./socket-events');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(express.static(path.join(__dirname, 'public')));

server.listen(port, function() {
  console.log('server listening at ' + port);
});

// viewed at http://localhost:3000
app.get('/', function(req, res) {
  res.render('index');
});

// DB
var numPlayers = 0;
var board = [];
var lastMoved = undefined;

io.sockets.on('connection', function (socket) {

  // When board is submitted by a player
  socket.on('submitBoard', function(data) {
    // Check to see if too many players
    numPlayers++;
    if (numPlayers>2) {
      console.log('sorry, max players is 2');
      socket.emit('shutdown')
    } else {
      // If not too many players, add board
      board.push({
        id: socket.id,
        ships: data.ships,
        cellCount: data.cellCount,
        hitCount: 0,
        targetedCells: []
      });
      console.log(socket.id + 'submitted board \nBoard: ' + board);
    }    
  });

  // When player makes a move
  socket.on('move', function(data) {

    if (lastMoved === socket.id) {
      socket.emit('doubleMoveNotAllowed');
      return undefined;
    }

    // if player name matches first board, i.e. it is their own board, check the other board
    if (socket.id === board[0].id) {
      check(socket, data, board[1], sio);
    } else {
      check(socket, data, board[0], sio);
    }

    // Set last move to player that just moved
    lastMoved = socket.id;
  })
});





// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});