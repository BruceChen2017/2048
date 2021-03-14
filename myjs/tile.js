/**
 * @constructor
 * @param {Map} position 
 * @param {number} value 
 */
function Tile(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;

    this.previousPosition = null;
    this.mergeFrom = null;
}