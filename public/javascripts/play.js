$(function() {
  
  var socket = io.connect('http://localhost:3000');


  // Make board
  var x, y;

  for(y=9; y>=0; y--) {
    $('#table').append('<tr id=' + [y] + '>')
    for(x=0; x<10; x++) {
      var yc = y.toString();
      var xc = x.toString();
      var coor = '['+xc+ ', '+yc+']';
      $('#' + [yc]).append('<td class="cell" id="' + coor + '"</td>')
    }
    $('#table').append('</tr>')
  }



  // Put pieces
  // object within ship for each ship
  var ships = [];
  $('.cell').on('click', function() {
    ships.push($(this).attr('id'));
    $(this).css('background-color', 'blue');
    console.log(ships);
  });


  $('#submitBoard').on('click', function() {
    $('.cell').css('background-color', 'red');
    var name = $('#playerName').val();
    socket.emit('submitBoard', {
      name: name, 
      ships: ships
    });
  });

  

  socket.on('test', function (data) {
    console.log('connected');
    // socket.emit('my other event', { my: 'data' });
  });




});