Function.prototype.bind = Function.prototype.bind || function (target) {
  var that = this;
  return function (args) {
    if (!(args instanceof Array)) {
      args = [args];
    }
    that.apply(target, args);
  };
};
