module.exports = function (socket, targetedCell, board, sio) {
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
        console.log('sunk')

        // Need to send the ship that was destroyed and the cell that was targeted
        var obj = {ship: ship.ship, targetedCell: targetedCell}
        
        // If sunk, notify clients
        sio.sunk(socket, obj);

        // If this was last ship sunk, game is over and notify clients
        if (board.hitCount >= board.cellCount) {
          console.log('game over')

          // Notify clients of end of game
          sio.gameOver(socket, targetedCell);
        }
      }
    }
  });

  // Check toggle - if missed
  if (miss===true) {
    console.log('Miss!');

    // Notify clients of miss
    sio.miss(socket, targetedCell);

  } else if (miss===false) {
    console.log('Hit!');

    // Notify clients of hit
    sio.hit(socket, targetedCell);
  }

  function cellAlreadyTaken(targetedCell, targetedCells) {
    if (isInArray(targetedCell, targetedCells)) {
      console.log('Cell already targeted')

      sio.alreadyTaken(socket);
      return true;
    }
    return false;
  }

  // Helper function to check if item is in array
  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }
}