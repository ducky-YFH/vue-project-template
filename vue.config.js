const pxtovw = require("postcss-px-to-viewport");

module.exports = {
  devServer: {
    overlay: {
      warning: false,
      errors: false,
    },
    proxy: {
      "/api": {
        target: process.env.VUE_APP_BASE_URL,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          "^api": "",
        },
      },
    },
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          new pxtovw({
            unitToConvert: "px",
            viewportWidth: 375,
            unitPrecision: 5,
            propList: ["*"],
            viewportUnit: "vw",
            fontViewportUnit: "vw",
            selectorBlackList: [],
            minPixelValue: 1,
            mediaQuery: false,
            replace: true,
            exclude: [/node_modules/],
          }),
        ],
      },
    },
  },
  chainWebpack: config =>{
    config.plugin('html')
      .tap(args => {
        args[0].title = "发薪进度统计";
        return args;
      })
  },
};
