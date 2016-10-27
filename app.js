var express = require('express');
var app = express();
var path = require('path');
var $ = require('jquery');
var port = 3000;


var server = require('http').createServer(app);
var io = require('socket.io')(server);

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
      socket.username = data.name;
      board.push({
        player: data.name,
        ships: data.ships,
        cellCount: data.cellCount,
        hitCount: 0,
        targetedCells: []
      });
      console.log(socket.username + 'submitted board \nBoard: ' + board);
    }    
  });

  socket.on('move', function(data) {
    // if matches, check the other board
    if (socket.username === board[0].player) {
      checkMove(data, board[1]);
    } else {
      checkMove(data, board[0]);
    }
  })


  function checkMove(targetedCell, board) {
    // console.log(targetedCell);
    var miss = true;

    if(cellAlreadyTaken(targetedCell, board.targetedCells)) return undefined;

    board.targetedCells.push(targetedCell);

    board.ships.forEach(function(ship) {

      // If ship is hit      
      if (isInArray(targetedCell, ship.coordinates)) {        
        miss = false;
        board.hitCount++;

        var hits = ship.hits;
        ship.hits = hits + 1;
        if (ship.hits >= ship.maxHits) {
          // miss = undefined;
          var obj = {ship: ship.ship, targetedCell: targetedCell}
          socket.emit('sunk', obj);
          socket.broadcast.emit('gotSunk', obj);

          if (board.hitCount >= board.cellCount) {
            socket.emit('youWin');
            socket.broadcast.emit('youLose');
          }
        }
      }
    });

    if (miss===true) {
      console.log('Miss!');
      socket.emit('miss', targetedCell);
      socket.broadcast.emit('gotMissed', targetedCell);
    } else if (miss===false) {
      console.log('Hit!');
      socket.emit('hit', targetedCell);
      socket.broadcast.emit('gotHit', targetedCell);
    }
  }

  function cellAlreadyTaken(targetedCell, targetedCells) {
    if (isInArray(targetedCell, targetedCells)) {
      socket.emit('cellAlreadyTaken');
      return true;
    }
    return false;
  }

  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }

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