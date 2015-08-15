"use strict";
var async = require('async');
var uuid = require('uuid');

module.exports.conditional = function(data) {
  return true;
};
module.exports.render = function(data, callback) {
  let output = "";

  // check our routing
  for (let template in this.templates) {
    if (template.conditional(object)) {
      return template.render(object, callback);
    }
  }

  let self = this;
  let child_object_renders = [];
  for (let field in data) {
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
};

