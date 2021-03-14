/**
 * @constructor
 * @param {number} size 
 */
function Grid(size) {
  this.size = size;
  this.cells = [];
  // init cells
  this.init();
}

Grid.prototype.init = function () {
  for (var x = 0; x < this.size; x++) {
    this.cells[x] = []; // column

    for (var y = 0; y < this.size; y++) {
      this.cells[x].push(null);
    }
  }
};

Grid.prototype.withinBound = function (position) {
  return position.x >= 0 && position.x < this.size &&
    position.y >= 0 && position.y < this.size;
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBound(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};


Grid.prototype.isFull = function () {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      if (!this.cells[x][y]) {
        return false;
      }
    }
  }
  return true;
};

Grid.prototype.emptyCells = function () {
  var emptyCells = [];
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      if (!this.cells[x][y]) {
        emptyCells.push({ x: x, y: y });
      }
    }
  }
  return emptyCells;
};
