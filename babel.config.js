module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          /**
           * Si `react-native-worklets` está instalado, babel-preset-expo inyecta
           * `react-native-worklets/plugin`. `nativewind/babel` (css-interop) ya lo incluye →
           * duplicado y errores tipo installTurboModule / makeMutable undefined.
           */
          worklets: false,
          /** Lo añadimos explícitamente al final de `plugins` (requisito de Reanimated). */
          reanimated: false,
        },
      ],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: { '@': './' },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
