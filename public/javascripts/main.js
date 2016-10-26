$(function() {

  var socket = io.connect('http://localhost:3000');

  // Make board

  var x, y;

  for(y=9; y>=0; y--) {
    $('#table').append('<tr id=' + [y] + '>');
    for(x=0; x<10; x++) {
      var yc = y.toString();
      var xc = x.toString();
      var coor = xc+yc;
      $('#' + yc).append('<td class="cell" id=' + coor + '></td>');
    }
    $('#table').append('</tr>');
  }

  // Log ship coordinates
  // var ships = [];
  // $('.cell').on('click', function() {
  //   ships.push($(this).attr('id'));
  //   $(this).css('background-color', 'blue');
  // });

  // var ships = [];
  // $('.cell').on('click', function() {
  //   ships.push($(this).attr('id'));
  //   $(this).css('background-color', 'blue');
  // });


  var ships = [];  
  var coordinates = [];
  var count, ship;

  $('.ship').on('click', function() {
    count = parseInt($(this).attr('holes'));
    ship = $(this).attr('id');
    coordinates = [];
  });

  $('.cell').on('click', function() {    
    $(this).css('background-color', 'blue');
    coordinates.push($(this).attr('id'))    
  });

  $('.save').on('click', function() {
    ships.push({
      ship: ship,
      coordinates: coordinates,
      maxHits: count,
      hits: 0
    });    
    console.log(ships);
  })
  



  // Send board to server
  $('#submitBoard').on('click', function() {
    var name = $('#playerName').val();
    socket.emit('submitBoard', {
      name: name, 
      ships: ships      
    });
    console.log(ships);
    $('#player').html(name);
    $('input#playerName').remove();
    $('button#submitBoard').remove();    
  });






  // Make attack board
  for(y=9; y>=0; y--) {
    $('#tablePlay').append('<tr id=' + 'play_' + [y] + '>');
    for(x=0; x<10; x++) {
      var yc = y.toString();
      var xc = x.toString();
      var coor = xc+yc;
      $('#' + 'play_' + [yc]).append('<td class="cellPlay" id=' + coor + '></td>');
    }
    $('#tablePlay').append('</tr>');
  }

  // Play!

  $('.cellPlay').on('click', function() {
    var cell = $(this).attr('id');
    socket.emit('move', cell);
  });


  // Outcomes

  socket.on('hit', function(data) {
    console.log(data);
    $('table#tablePlay').find('td#'+data).html('X');
  });

  socket.on('gotHit', function(data) {
    console.log(data);
    $('table#table').find('td#'+data).html('X');
  });

  socket.on('miss', function(data) {
    console.log(data);
    $('table#tablePlay').find('td#'+data).html('O');
  });

  socket.on('gotMissed', function(data) {
    console.log(data);
    $('table#table').find('td#'+data).html('O');
  });


  // Turn off a third player

  socket.on('shutdown', function() {
    $('.wrapper').remove();
    $('body').html('<h1>Sorry, max players is 2</h1>')
  });



});