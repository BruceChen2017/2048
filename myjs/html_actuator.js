/**
 * @constructor
 */
function HTMLActuator() {
  // section for inserting tile
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

/**
 * @param {Grid} grid
 * @param {Map} metadata 
 */
HTMLActuator.prototype.actuate = function (grid, metadata) {
  var that = this;

  window.requestAnimationFrame(function () {
    that.clearContainer(that.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          that.addTile(cell);
        }
      });
    });

    // update score part
    that.updateScore(metadata.score);

    // message part
    if (metadata.end) {
      if (metadata.over) {
        that.message(false); // You lose
      } else if (metadata.won) {
        that.message(true); // You win
      }
    }
  });

};

/**
 * @param {Tile} tile 
 */
HTMLActuator.prototype.addTile = function (tile) {
  var that = this;

  var outer = document.createElement("div");
  var inner = document.createElement("div"); // for tile value
  // render previousPosition first
  var position = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = "tile-position-" + (position.x + 1) + 
                                "-" + (position.y + 1);

  var classes = ["tile", "tile-" + tile.value, positionClass];
  outer.className = classes.join(" ");

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    // this callback will called after `addTile`
    window.requestAnimationFrame(function () {
      // update class name
      classes[2] = "tile-position-" + (tile.x + 1) + "-" + (tile.y + 1);
      outer.className = classes.join(" ");
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    outer.className = classes.join(" ");

    // add and render merged component tile
    tile.mergedFrom.forEach(function (mtile) {
      that.addTile(mtile);
    });
  } else {
    classes.push("tile-new");
    outer.className = classes.join(" ");
  }

  outer.appendChild(inner);

  // put the tile on the grid
  this.tileContainer.appendChild(outer);
};

/**
 * @param {number} score 
 */
HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;
  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;
    this.scoreContainer.appendChild(addition);
  }
};

/**
 * @param {HTMLElement} container 
 */
HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

/**
 * @param {boolean} won 
 */
HTMLActuator.prototype.message = function (won) {
  var type = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearMessage = function () {
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
