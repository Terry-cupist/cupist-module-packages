module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./src",
            "@core": "./src/core",
            "@glam": "./src/glam",
            "@hooks": "./src/hooks",
          },
        },
      ],
    ],
  };
};
