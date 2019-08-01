const React = require("react");
const ReactDom = require("react-dom");

module.exports = {
  render: (options) => {
    if (!options) {
      console.warn("drout renderer called on null");
      return null;
    }
    if (!options.component && !options.componentId) {
      return JSON.stringify(options);
    }
    let component = options.component;
    if (!component) {
      const componentId = options.componentId;
      try {
        component = require(componentId);
      } catch(err) {
        console.error(err);
      }
    }
    return component.render(options);
  },
  React,
  ReactDom,
};
