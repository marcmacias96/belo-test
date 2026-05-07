const React = require('react');

const insets = { top: 0, right: 0, bottom: 0, left: 0 };
const frame = { x: 0, y: 0, width: 390, height: 844 };

const SafeAreaInsetsContext = React.createContext(insets);
const SafeAreaFrameContext = React.createContext(frame);

function SafeAreaProvider({ children }) {
  return React.createElement(
    SafeAreaFrameContext.Provider,
    { value: frame },
    React.createElement(SafeAreaInsetsContext.Provider, { value: insets }, children),
  );
}

function SafeAreaConsumer({ children }) {
  return children(insets);
}

function useSafeAreaInsets() {
  return insets;
}

function useSafeAreaFrame() {
  return frame;
}

module.exports = {
  SafeAreaProvider,
  SafeAreaConsumer,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics: { insets, frame },
};
