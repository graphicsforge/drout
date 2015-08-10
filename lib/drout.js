"use strict";
var eventEmitter = require('events').EventEmitter;
var async = require('async');


class Drout extends eventEmitter
{
  constructor(conditional, renderTemplate, options) {
    super();

    // TODO error handling
    this.conditional = conditional;
    this.renderTemplate = renderTemplate;
    this.options = options;

    if (typeof(this.conditional) === 'undefined') {
      this.conditional = function(data) {
        return true;
      }
    }
    if (typeof(this.renderTemplate) === 'undefined') {
      this.renderTemplate = function(data, callback) {
        callback(null, data.toString());
      }
    }
    if (typeof(this.options) === 'undefined') {
      this.options = {};
    }

    this.templates = [];
  }

  render(data, callback) {
    for (let template in this.templates) {
      if (template.conditional(data)) {
        template.render(data, callback);
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

// basic form builder example
class DroutForm extends Drout
{
  constructor() {
    super();
  }

  render(data, callback) {
    let output = "";
    if (!"_drout_id_" in data) {
    }

    // check our routing
    for (let template in this.templates) {
      if (template.conditional(object)) {
        return template.render(object, callback);
      }
    }

    console.log(data);
    for (let field in data) {
      // ignore inherited
      if (!data.hasOwnProperty(field)) continue;
      // ignore reserved field names
      if (field.match(/^_drout_/)) continue;
      // ignore functions?
      if (typeof(data[field])=="function") continue;

      // recurse into objects
      if (typeof(data[field])=="object") {
        if (typeof(data["_drout_ancestor_"])=="undefined") {
          data["_drout_ancestor_"] = data;
        } else {
          data["_drout_ancestor_"] = data["_drout_ancestor_"];
        }
        this.render(data, callback);
      }

      output += `
        <label varname='${field}'>
          <input value='${data[field]}' onchange='socket.emit("_drout_", ${JSON.stringify(data)});'/>
        </label>
      `;
    }
    return callback(null, output);
  }
}

module.exports = Drout;
module.exports.DroutForm = DroutForm;
// TODO don't do this
module.exports.css = `
label[varname] {
  display: block;
}
label[varname]::before {
   content: attr(varname) ": ";
}
`;
