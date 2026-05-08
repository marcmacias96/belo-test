'use strict';

/**
 * Stub de VirtualizedList sin timers `_updateCellsToRender` para que Jest cierre proceso
 * limpio después de cada suite (--runInBand / workers).
 *
 * Delega el resto del paquete al módulo real (SectionList, helpers, tipos omitidos aquí).
 */
const React = require('react');
const { ScrollView } = require('react-native');
const actual = jest.requireActual('@react-native/virtualized-lists');

function pushChild(rows, node, fallbackKey) {
  if (node == null || node === false) return;
  rows.push(
    React.isValidElement(node) ? React.cloneElement(node, { key: fallbackKey }) : node,
  );
}

function VirtualizedListMock(props) {
  const {
    data,
    renderItem,
    keyExtractor,
    ListHeaderComponent,
    ListFooterComponent,
    ItemSeparatorComponent,
    ListEmptyComponent,
    testID,
    accessibilityLabel,
    contentContainerStyle,
    horizontal,
  } = props;

  const listData = Array.isArray(data) ? data : [];
  const rows = [];

  if (listData.length === 0 && ListEmptyComponent != null) {
    const Empty = ListEmptyComponent;
    pushChild(rows, typeof Empty === 'function' ? React.createElement(Empty, {}) : Empty, '__empty');
    return React.createElement(
      ScrollView,
      { testID, accessibilityLabel, contentContainerStyle, horizontal },
      rows,
    );
  }

  if (ListHeaderComponent != null) {
    const Header = ListHeaderComponent;
    pushChild(rows, typeof Header === 'function' ? React.createElement(Header, {}) : Header, '__header');
  }

  listData.forEach((item, index) => {
    if (index > 0 && ItemSeparatorComponent != null) {
      pushChild(
        rows,
        React.createElement(ItemSeparatorComponent, {
          leadingItem: listData[index - 1],
          trailingItem: listData[index],
        }),
        `__sep_${index}`,
      );
    }

    const rendered =
      typeof renderItem === 'function'
        ? renderItem({
            item,
            index,
            separators: {
              highlight: () => {},
              unhighlight: () => {},
              updateProps: () => {},
            },
          })
        : null;

    if (rendered != null && React.isValidElement(rendered)) {
      const rk = typeof keyExtractor === 'function' ? keyExtractor(item, index) : String(index);
      rows.push(React.cloneElement(rendered, { key: rk }));
    } else if (rendered != null) {
      rows.push(rendered);
    }
  });

  if (ListFooterComponent != null) {
    const Footer = ListFooterComponent;
    pushChild(rows, typeof Footer === 'function' ? React.createElement(Footer, {}) : Footer, '__footer');
  }

  return React.createElement(
    ScrollView,
    { testID, accessibilityLabel, contentContainerStyle, horizontal },
    rows,
  );
}

VirtualizedListMock.displayName = 'VirtualizedList';

module.exports = {
  __esModule: true,
  ...actual,
  default: Object.assign({}, actual.default, {
    VirtualizedList: VirtualizedListMock,
  }),
};
