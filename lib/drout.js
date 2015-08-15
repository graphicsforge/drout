"use strict";
var eventEmitter = require('events').EventEmitter;
var async = require('async');
var uuid = require('uuid');

class Drout extends eventEmitter
{
  constructor(conditional, renderTemplate, src) {
    super();

    // TODO error handling
    this.conditional = conditional;
    this.renderTemplate = renderTemplate;
    this.src = src;

    if (typeof(this.conditional) !== 'function') {
      if (this.src) {
        console.log(`WARNING: unspecified conditional function in ${this.src}`);
      }
      this.conditional = function(data) {
        return true;
      }
    }
    if (typeof(this.renderTemplate) !== 'function') {
      if (this.src) {
        console.log(`WARNING: unspecified render function in ${this.src}`);
      }
      this.renderTemplate = function(data, callback) {
        callback(null, data.toString());
      }
    }

    this.templates = [];
  }

  render(data, callback) {
    for (let i=0; i<this.templates.length; i++) {
      if (this.templates[i].conditional(data)) {
        this.templates[i].render(data, callback);
        return true;
      }
    }

    // perform default route
    if (this.conditional(data)) {
      this.renderTemplate(data, callback);
      return true;
    }
    return false;
  }

}

// server-side only functions
if (typeof(process.browser)==='undefined') {
  let fs = require('fs');
  Drout.prototype.loadRoutes = function(directory) {
    let files = fs.readdirSync(directory);
    for (let i=0; i<files.length; i++) {
      let filename = files[i];
      if (!filename.match(/\.js$/)) continue;
      let route = require(directory+filename);
      route = new Drout(route.conditional, route.render);
      route.src = directory+filename;
      this.templates.unshift(route);
    }
  }

}


module.exports = Drout;
module.exports.boilerplate = function() {
  let drout = new Drout();
  drout.loadRoutes(__dirname + "/routes/");
  return drout;
};
// TODO don't do this
module.exports.css = `
label[varname] {
  display: block;
}
label[varname]::before {
   content: attr(varname) ": ";
}
`;
