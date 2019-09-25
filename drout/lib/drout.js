const React = require("react");
const ReactDom = require("react-dom");

const getComponent = (options) => {
  if (!options.component && !options.componentId) return null;
  let component = options.component;
  if (!component) {
    const componentId = options.componentId;
    try {
      component = require(componentId);
    } catch(err) {
      console.error(err);
    }
  }
  return component;
}

class Drout {
  static render(options) {
    if (!options) {
      console.warn("drout renderer called on null");
      return null;
    }
    const component = getComponent(options);
    if (!component) return JSON.stringify(options);
    return component.render(options);
  }
  static getDefault(options) {
    const component = getComponent(options);
    if (component && component.getDefault) {
      return component.getDefault(options);
    }
    return null;
  }
}
Drout.React = React;
Drout.ReactDom = ReactDom;

module.exports = Drout;
