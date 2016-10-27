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

  // When player makes a move
  socket.on('move', function(data) {
    // if player name matches first board, i.e. it is their own board, check the other board
    if (socket.username === board[0].player) {
      checkMove(data, board[1]);
    } else {
      checkMove(data, board[0]);
    }
  })


  function checkMove(targetedCell, board) {
    // Toggle for whether there was a hit
    var miss = true;

    // Check if player has already targeted this cell
    if(cellAlreadyTaken(targetedCell, board.targetedCells)) return undefined;

    // If not, add cell to array of cells that have been targeted
    board.targetedCells.push(targetedCell);

    // Loop throuch each ship on board
    board.ships.forEach(function(ship) {

      // If a ship was on the targeted cell     
      if (isInArray(targetedCell, ship.coordinates)) {     
        // Toggle - there was a hit   
        miss = false;

        // Add hit to hit count - counts number of times a board has been hit and compares it to number of cells of ships placed
        board.hitCount++;

        // Number of times the particular ship has been hit
        var hits = ship.hits;
        ship.hits = hits + 1;

        // Check if the number of hits on the ship is equal to the entire ship i.e. the ship is sunk
        if (ship.hits >= ship.maxHits) {
          var obj = {ship: ship.ship, targetedCell: targetedCell}

          // If sunk, notify clients
          socket.emit('sunk', obj);
          socket.broadcast.emit('gotSunk', obj);

          // If this was last ship sunk, game is over and notify clients
          if (board.hitCount >= board.cellCount) {
            socket.emit('youWin');
            socket.broadcast.emit('youLose');
          }
        }
      }
    });

    // Check toggle - if missed
    if (miss===true) {
      console.log('Miss!');

      // Notify clients of miss
      socket.emit('miss', targetedCell);
      socket.broadcast.emit('gotMissed', targetedCell);
    } else if (miss===false) {
      // If it was not a miss, it was a hit
      console.log('Hit!');

      // Notify clients of hit
      socket.emit('hit', targetedCell);
      socket.broadcast.emit('gotHit', targetedCell);
    }
  }

  // Helper function to check if cell already targeted
  function cellAlreadyTaken(targetedCell, targetedCells) {
    if (isInArray(targetedCell, targetedCells)) {
      socket.emit('cellAlreadyTaken');
      return true;
    }
    return false;
  }

  // Helper function to check if item is in array
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