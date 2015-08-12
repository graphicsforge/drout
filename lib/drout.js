"use strict";
var eventEmitter = require('events').EventEmitter;
var async = require('async');
var uuid = require('uuid');

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

    // check our routing
    for (let template in this.templates) {
      if (template.conditional(object)) {
        return template.render(object, callback);
      }
    }

    console.log(data);
    let self = this;
    let child_object_renders = [];
    for (let field in data) {
      console.log("field: " +field);
      // ignore inherited
      if (!data.hasOwnProperty(field)) continue;
      // ignore reserved field names
      if (field.match(/^_drout_/)) continue;
      // ignore functions?
      if (typeof(data[field])=="function") continue;

      // recurse into objects
      if (typeof(data[field])=="object") {
        if (!data[field]) continue;
        if (typeof(data["_drout_ancestor_"])=="undefined") {
          data[field]["_drout_ancestor_"] = data;
        } else {
          data[field]["_drout_ancestor_"] = data["_drout_ancestor_"];
        }
        child_object_renders.push(function(callback) {
          self.render(data[field], function(err, output) {
            callback(err, `<div varname='${field}'>${output}</div>`);
          });
        });
        continue;
      }

      output += `
        <label varname='${field}'>
          <input value='${data[field]}'/>
        </label>
      `;
    }
    async.parallel(child_object_renders, function(err, renders) {
      output += renders.join("\n");

      // if we're at the top level of a render, wrap it
      if (typeof(data["_drout_ancestor_"])=="undefined") {
        // identify it some way
        let drout_id = uuid.v4();
        output = `
          <div _drout_id_='${drout_id}'>
            ${output}
          </div>
          <script>
            window.attachEvent('onload', function() {
              var element = document.querySelector('[_drout_id_="${drout_id}"]');
              console.log("we should have loaded our dom by now:");
              console.log(element);
            });
          </script>
        `;
      }

      callback(null, output);
    });
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
