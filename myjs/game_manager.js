/**
 * @constructor
 * @param {number} size 
 * @param {KeyboardInputManager} InputManager 
 * @param {HTMLActuator} Actuator 
 */
function GameManager(size, InputManager, Actuator) {
  this.size = size;
  this.inputManager = InputManager;
  this.actuator = Actuator;
  this.startTiles = 2;
  this.directionMap = {
    0: { x: 0, y: -1 }, // Up
    1: { x: 1, y: 0 },  // Right
    2: { x: 0, y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  // initial state
  this.init();
}


/**
 * key logic of game
 * @param {number} direction 
 * @returns {void}
 */
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var that = this;

  if (this.isEnd()) return;
  var cell, tile;

  var xyDelta = this.directionMap[direction];
  var traversals = this.buildTraversals(xyDelta);
  var moved = false;

  this.prepareTiles(); // save previousPosition and null mergedFrom

  // key logic: traverse
  traversals.xOrder.forEach(
    function (x) {
      traversals.yOrder.forEach(
        function (y) {
          cell = { x: x, y: y };
          tile = that.grid.cellContent(cell);

          if (tile) {
            var positions = that.findFarthestPosition(cell, xyDelta);
            var next = that.grid.cellContent(positions.next); // next: Tile

            // `!next.mergedFrom` means: 
            // e.g. consider one sequence 2-4-2-2 with direction `->`
            // then merge result would be 2-4-4, not 2-8!
            if (next && next.value === tile.value && !next.mergedFrom) {
              var merged = new Tile({ x: next.x, y: next.y }, next.value * 2);
              that.grid.cells[tile.x][tile.y] = null;
              tile.x = next.x;
              tile.y = next.y;
              that.grid.cells[next.x][next.y] = merged;
              merged.mergedFrom = [tile, next];

              that.score += merged.value;
              if (merged.value === 2048) {
                that.won = true;
              }
            } else {
              // update tile and grid
              var farthest = positions.farthest;
              that.grid.cells[tile.x][tile.y] = null;
              tile.x = farthest.x;
              tile.y = farthest.y;
              that.grid.cells[farthest.x][farthest.y] = tile;
            }

            if (cell.x !== tile.x || cell.y !== tile.y) {
              moved = true; // The tile moved from its original cell!
            }

          }
        }
      );
    }
  );

  if (moved) {
    // moved === true means grid is not full
    // thus we can add one more tile
    this.addRandomTile();

    if (!this.canContinue()) {
      this.over = true;
    }

    // repaint
    this.actuate();
  }


};


GameManager.prototype.addRandomTile = function () {
  // first get avaible cells
  var emptyCells = this.grid.emptyCells();
  // then randomly select one
  // in js, boolean([]) is true
  var newCell;
  if (emptyCells.length) {
    newCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  var newValue = Math.random() < 0.9 ? 2 : 4;
  // var newValue = 1024; // for test win state
  var newTile = new Tile(newCell, newValue);
  this.grid.cells[newCell.x][newCell.y] = newTile;

};

GameManager.prototype.canContinue = function () {
  // two checks
  // check 1: is full: not full -> can move -> can continue
  var isFull = this.grid.isFull();
  if (!isFull) return true;
  // check 2: can move: can move -> can continue
  var canMove = this.canMove();
  if (canMove) return true;
  return false;

};

GameManager.prototype.canMove = function () {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      // curCell = { x: x, y: y };
      for (var dir = 0; dir < 4; dir++) {
        var xyDelta = this.directionMap[dir];
        var newCell = { x: x + xyDelta.x, y: y + xyDelta.y };
        if (this.grid.withinBound(newCell)) {
          if (this.grid.cells[x][y].value === 
                this.grid.cells[newCell.x][newCell.y].value) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

GameManager.prototype.prepareTiles = function () {
  this.grid.cells.forEach(function (column) {
    column.forEach(function (tile) {
      if (tile) {
        tile.mergedFrom = null;
        tile.previousPosition = { x: tile.x, y: tile.y };
      }
    });
  });
};

/**
 * @param {Map} cell 
 * @param {Map} xyDelta 
 * @returns {Map}
 */
GameManager.prototype.findFarthestPosition = function (cell, xyDelta) {
  var previous;
  do {
    previous = cell;
    cell = { x: previous.x + xyDelta.x, y: previous.y + xyDelta.y };
  } while (!this.grid.cellContent(cell) && this.grid.withinBound(cell));
  return {
    farthest: previous,
    next: cell
  };
};

/**
 * @param {Map} xyDelta 
 * @returns {Map}
 */
GameManager.prototype.buildTraversals = function (xyDelta) {
  var xOrder = [];
  var yOrder = [];
  for (var i = 0; i < this.size; i++) {
    xOrder.push(i);
    yOrder.push(i);
  }
  if (xyDelta.x === 1) {
    xOrder.reverse();
  }
  if (xyDelta.y === 1) {
    yOrder.reverse();
  }
  return {
    xOrder: xOrder,
    yOrder: yOrder
  };
};

GameManager.prototype.isEnd = function () {
  return this.over || this.won;
};

GameManager.prototype.restart = function () {
  this.actuator.continueGame();
  this.init();
};

GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};


GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over: this.over,
    won: this.won,
    end: this.isEnd()
  });
};

GameManager.prototype.init = function () {
  this.grid = new Grid(this.size);
  this.score = 0;
  this.over = false;
  this.won = false;

  // add initial tiles
  this.addStartTiles();

  // start painting
  this.actuate();
};
