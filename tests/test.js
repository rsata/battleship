var chai = require('chai');
var expect = require('chai').expect;
var checkMove = require('../check-move');
// var io = require('socket.io-client')

var board = [
  {
    player: 'player1',
    ships: [
      {
        coordinates: [09,19,29,39,49],
        hits: 0,
        maxHits: 5,
        ship: 'carrier_5'
      },
      {
        coordinates: [03,13,23],
        hits: 2,
        maxHits: 3,
        ship: 'sub_3'
      }
    ],
    cellCount: 8,
    hitCount: 2,
    targetedCells: [12,13]
  },
  {
    player: 'player2',
    ships: [{
        coordinates: [12,13,14,15,16],
        hits: 0,
        maxHits: 5,
        ship: 'carrier_5'
      },
      {
        coordinates: [45,46],
        hits: 0,
        maxHits: 2,
        ship: 'destroyer_2'
      }
    ],
    cellCount: 7,
    hitCount: 3,
    targetedCells: [03,13]
  }
];


describe('check move function', function() {

  it('hit count should increment', function() {    
    var input = board[1].hitCount;
    var output = checkMove(socket, 23, board[0]);
    expect(input).to.equal(output[0].hitCount-1);
  }); 

  // it('hit count should increment', function() {
  //   var socket = io.connect('http://localhost:3000', {
  //     'reconnection delay' : 0,
  //     'reopen delay' : 0,
  //     'force new connection' : true
  //   });

  //   socket.on('connect', function () {
  //     console.log('connection successful');
  //     var input = board[1].hitCount;
  //     var output = checkMove(socket, 23, board[0]);
  //     expect(input).to.equal(output[0].hitCount-1);      
  //   });
  // }); 

  // it('yaya', function() {
  //   var io = require('socket.io-client');
  //   var options = {
  //     transports: ['websocket'],
  //     'force new connection': true,
  //     path: '/'
  //   };
  //   var client = io("http://localhost:3000", options);
  //   client.on('connect', function () {
  //     console.log('connected')
  //     done();
  //   });
  // });

});