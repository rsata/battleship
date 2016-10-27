$(function() {

  var socket = io.connect('http://localhost:3000');

  /***

      MAKE BOARDS
  
  ***/

  // Setup board
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

  // Attack board
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

  /***

      SETUP SHIPS
  
  ***/

  var ships = [];
  var coordinates = [];
  var selectedCells = [];
  var count, counter, ship;
  var cellCount = 0;

  /***
      Select ship to place on board
  ***/

  $('.ship').on('click', function() {

    // Visual - select ship
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');

    // Set variables for ship
    count = parseInt($(this).attr('holes'));
    counter = 0;
    ship = $(this).attr('id');
    coordinates = [];
  });

  // Select cells for ship
  $('.cell').on('click', function() {
    // Check if ship already on clicked cell, if ship is selected, if max number of cells already selected for ship
    if (isInArray($(this).attr('id'), selectedCells) || ship === undefined || counter >= count) {
      alert("You need to select a ship.  Ships on the board cannot overlap.  Select the correct number of cells on the board for each ship.");
      return undefined;
    }

    // Visual - select cell
    $(this).css('background-color', 'blue');

    // Add coordinates to ship
    coordinates.push($(this).attr('id'));

    // Add clicked cells to array ensure no double click
    selectedCells.push($(this).attr('id'));

    // Increment variables
    counter++;
    cellCount++;
  });

  /***
      Save ship placement
  ***/

  $('.save').on('click', function() {

    // Add ship parameters
    ships.push({
      ship: ship,
      coordinates: coordinates,
      maxHits: count,
      hits: 0
    });

    // Visual - remove ship so can't re-add it
    $('#'+ship).addClass('hide');

    // Reset ship to add new one
    ship = undefined;
  });
  
  /***
      Send board to server
  ***/

  $('#submitBoard').on('click', function() {
    
    // Make sure ships follow rules - e.g. if 3 holes in ship, need to have 3 cells selected
    if (counter!=count) {
      alert('Please reset the board. Your ships do not follow the rules.');
      return undefined;
    }

    // Send board to server
    socket.emit('submitBoard', {
      ships: ships,
      cellCount: cellCount
    });

    // Visual - setup for playing
    $('#player').html(name);
    $('button#submitBoard').remove();
    $('td').removeClass('cell'); // so that can't add new blue cells after starting game
    $('#tablePlay').removeClass('hide');
    $('.save').addClass('hide');
    $('.reset').addClass('hide');

    console.log(ships);
  });

  // Check if cell is in array
  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }

  // Reset the board if made a mistake
  $('.reset').on('click', function() {
    ships = [];
    coordinates = [];
    count = undefined;
    counter = undefined;
    ship = undefined;
    cellCount = 0;
    selectedCells = [];
    $('#table > tr').children().css('background-color', 'red');
    $('#shipList').children().removeClass('selected');
    $('#shipList').children().removeClass('hide');
  });




  /***

      PLAY
  
  ***/

  // Trigger a move
  $('.cellPlay').on('click', function() {
    var cell = $(this).attr('id');
    socket.emit('move', cell);
  });




  /***

      OUTCOMES
  
  ***/

  socket.on('cellAlreadyTaken', function() {
    alert('You have already targeted that cell.');
  });

  socket.on('doubleMoveNotAllowed', function() {
    alert('Please wait for other player to move before going again.');
  });

  socket.on('hit', function(data) {
    // Mark the hit cell with an X
    $('table#tablePlay').find('td#'+data).html('X');
  });

  socket.on('gotHit', function(data) {  
    // Mark the hit cell with an X  
    $('table#table').find('td#'+data).html('X');
  });

  socket.on('miss', function(data) {  
    // Mark the hit cell with an O  
    $('table#tablePlay').find('td#'+data).html('O');
  });

  socket.on('gotMissed', function(data) {
    // Mark the hit cell with an O  
    $('table#table').find('td#'+data).html('O');
  });

  socket.on('sunk', function(data) {
    alert('you sunk ' + data.ship);
    // Mark the hit cell with an X
    $('table#tablePlay').find('td#'+data.targetedCell).html('X');
  });

  socket.on('gotSunk', function(data) {
    alert(data.ship + ' was sunk');
    // Mark the hit cell with an X
    $('table#table').find('td#'+data.targetedCell).html('X');
  });

  socket.on('youWin', function(data) {
    alert('You Win :)');
  });

  socket.on('youLose', function(data) {
    alert('You Lose :(');
  });




  /***

      NO THIRD PLAYER
  
  ***/

  socket.on('shutdown', function() {
    $('.wrapper').remove();
    $('body').html('<h1>Sorry, max players is 2</h1>')
  });



});