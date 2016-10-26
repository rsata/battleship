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
// var board = [
//   {
//     player: 1,
//     ships: [
//       {
//         coordinates: [09,19,29,39,49],
//         hits: 0,
//         maxHits: 5,
//         ship: 'carrier_5'
//       },
//       {
//         coordinates: [03,13,23,33,43],
//         hits: 0,
//         maxHits: 5,
//         ship: 'carrier_5'
//       }
//     ]
//   },
//   {
//     player: 2,
//     ships: [{
//         coordinates: [12,13,14],
//         hits: 0,
//         maxHits: 5,
//         ship: 'carrier_5'
//       },
//       {
//         coordinates: [45,46],
//         hits: 0,
//         maxHits: 5,
//         ship: 'carrier_5'
//       }
//     ]
//   }
// ];


io.sockets.on('connection', function (socket) {

  socket.on('submitBoard', function(data) {
    numPlayers++;
    if (numPlayers>2) {
      console.log('sorry, max players is 2');
      socket.emit('shutdown')
    } else {
      socket.username = data.name;
      board.push({
        player: data.name,
        ships: data.ships        
      });    
      console.log(board);
      console.log('req from ' + socket.username);
    }    
  });

  socket.on('move', function(data) {
    // console.log(socket.username);
    // if matches, check the other board
    if (socket.username === board[0].player) {
      checkMove(data, board[1].ships);
    } else {
      checkMove(data, board[0].ships);
    }
  })





  function checkMove(targetedCell, ships) {
    console.log(targetedCell);
    var miss = true;
    ships.forEach(function(ship) {      
      if (isInArray(targetedCell, ship.coordinates)) {        
        miss = false;
        var hits = ship.hits;
        ship.hits = hits + 1;
        console.log(ship.hits);
        console.log(ship.maxHits);
        if (ship.hits >= ship.maxHits) {
          miss = undefined;
          socket.emit('sunk', ship.ship);
          socket.broadcast.emit('gotSunk', ship.ship)
        }
      }
    });

    if (miss===true) {
      console.log('Miss!');
      socket.emit('miss', targetedCell);
      socket.broadcast.emit('gotMissed', targetedCell);
    } else if (miss===false) {
      socket.emit('hit', targetedCell);
      socket.broadcast.emit('gotHit', targetedCell);
      console.log('Hit!');
    }
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