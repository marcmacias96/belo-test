'use strict';

/**
 * Iconos síncronos para Jest: el paquete real hidrata fuentes con setState async y genera
 * advertencias "not wrapped in act". Ver moduleNameMapper en package.json.
 */
const React = require('react');
const { Text } = require('react-native');

function MockIcon({ name = 'icon', ...rest }) {
  return React.createElement(Text, rest, String(name));
}

const base = {
  __esModule: true,
  default: MockIcon,
};

module.exports = new Proxy(base, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return MockIcon;
  },
});
