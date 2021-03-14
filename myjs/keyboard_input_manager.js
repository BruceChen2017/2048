/**
 * @constructor
 */
function KeyboardInputManager() {
    this.events = {}
    if (window.navigator.msPointerEnabled) {
        // for IE
        this.eventTouchstart = "MSPointerDown";
        this.eventTouchmove = "MSPointerMove";
        this.eventTouchend = "MSPointerUp";
    } else {
        this.eventTouchstart = "touchstart";
        this.eventTouchmove = "touchmove";
        this.eventTouchend = "touchend";
    }

    this.listen();
}

/**
 * add callback for event
 * @param {string} event 
 * @param {function} callback 
 */
KeyboardInputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
}

/**
 * execute callback
 * @param {string} event 
 * @param {any} data 
 */
KeyboardInputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event]; // array <- see method `on` 
    if (callbacks) {
        callbacks.forEach(function (callback) {
            callback(data);
        });
    }
};

KeyboardInputManager.prototype.listen = function () {
    var that = this;

    var map = {
        38: 0, // Up
        39: 1, // Right
        40: 2, // Down
        37: 3, // Left
        87: 0, // W
        68: 1, // D
        83: 2, // S
        65: 3  // A
    };

    // respond to direction key
    document.addEventListener("keydown", function (event) {
        var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
            event.shiftKey;
        var mapped = map[event.which];

        if (!modifiers) {
            if (mapped !== undefined) {
                // disable default action for event
                // e.g. clink <a> tag will jump to page of that link
                event.preventDefault();
                that.emit("move", mapped) // callback for event
            }
        }
    });

    this.bindButtonPress(".retry-button", this.restart);
    this.bindButtonPress(".restart-button", this.restart);
    // in the case: 2048 more
    // this.bindButtonPress(".keep-playing-button", this.keepPlaying)

    // respond to swipe events for mobile devices
    // swipe events == move events == touchstart + touchmove + touchend
    var touchStartClientX, touchStartClientY;
    var gameContainer = document.getElementsByClassName("game-container")[0];

    // touchstart
    gameContainer.addEventListener(this.eventTouchstart, function (event) {
        if ((!window.navigator.msPointerEnabled && event.touches.length > 1) || event.targetTouches.length > 1) {
            return; // Ignore if touching with more than oen finger
        }

        if (window.navigator.msPointerEnabled) {
            touchStartClientX = event.pageX;
            touchStartClientY = event.pageY;
        } else {
            touchStartClientX = event.touches[0].clientX;
            touchStartClientY = event.touches[0].clientY;
        }

        event.preventDefault();
    });

    // touchmove
    gameContainer.addEventListener(this.eventTouchmove, function (event) {
        event.preventDefault();
    });

    // touchend
    gameContainer.addEventListener(this.eventTouchend, function (event) {
        if ((!window.navigator.msPointerEnabled && event.touches.length > 1) || event.targetTouches.length > 1) {
            return; // Ignore if touching with more than oen finger
        }

        var touchEndClientX, touchEndClientY;

        if (window.navigator.msPointerEnabled) {
            touchEndClientX = event.pageX;
            touchEndClientY = event.pageY;
        } else {
            touchEndClientX = event.touches[0].clientX;
            touchEndClientY = event.touches[0].clientY;
        }

        var dx = touchEndClientX - touchStartClientX;
        var dy = touchEndClientY - touchStartClientY;
        var absDx = Math.abs(dx);
        var absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > 10) {
            // (right: left): (down: up)
            that.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
        }
    });

};

/**
 * @param {KeyboardEvent} event 
 */
KeyboardInputManager.prototype.restart = function (event) {
    event.preventDefault();
    this.emit("restart");
};

/**
 * @param {string} selector 
 * @param {function} fn 
 */
KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
    var button = document.querySelector(selector);
    button.addEventListener("click", fn.bind(this));
    button.addEventListener(this.eventTouchend, fn.bind(this));
};