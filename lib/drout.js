"use strict";

class Drout
{

  constructor(conditional, options, callback) {

    if (arguments.length > 1) {
      this.conditional = arguments[0];
    } else {
      this.conditional = function() { return true; };
    }

    if (arguments.length > 2) {
      // TODO should this be less ad-hoc?
      for (option in options) {
        if (!options.hasOwnProperty(option)) continue;
        this[option] = options[option];
      }
    }

    this.callback = arguments[arguments.length-1];

    this.handlers = [];
  }

  render(object, callback) {
    // last resort fallback
    return callback(null, object.toString());
  }
}

module.exports = Drout
