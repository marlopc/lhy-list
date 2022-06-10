const path = require("path");

module.exports = {
  packagerConfig: {
    icon: path.join(__dirname, "src", "assets", "images", "icon"),
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        iconUrl:
          "https://github.com/marlopc/lhy-list/blob/main/src/assets/images/icon.ico?raw=true",
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.tsx",
              name: "main_window",
              preload: {
                js: "./src/preload.ts",
              },
            },
          ],
        },
      },
    ],
  ],
};
