const {defineConfig} = require("@vue/cli-service");
const FileManagerPlugin = require("filemanager-webpack-plugin");

module.exports = defineConfig({
    publicPath: process.env.BASE_URL,
    outputDir: "dist",
    assetsDir: "assets",
    indexPath: "index.html",
    filenameHashing: true,
    lintOnSave: true,
    runtimeCompiler: false,
    transpileDependencies: ["js-base64", "dmn-js", "dmn-js-properties-panel"],
    productionSourceMap: false,
    configureWebpack: config => {
        // 生产环境
        if (process.env.NODE_ENV === "production") {
            // 打包工具
            config.plugins.push(
                new FileManagerPlugin({
                    events: {
                        onEnd: {
                            // 删除 dist.zip
                            delete: ["./dist.zip"],
                            // 打包 dist 目录
                            archive: [{source: "./dist", destination: "./dist.zip"}]
                        }
                    }
                })
            );
        }
        // 开发环境
        //if (process.env.NODE_ENV === "development") {
        //}
    },
    chainWebpack: config => {
        // 修改htmlWebpackPlugin
        config.plugin("html").tap(args => {
            args[0].title = process.env.VUE_APP_TITLE;
            return args;
        });

        // 自定义资源
        config.module
            .rule("uri")
            .resourceQuery(/asset=resource/)
            .set("type", "asset/resource")
            .set("generator", {filename: "assets/[name].[hash:8][ext]"});

        // whitespace: 'preserve' | 'condense'
        // preserve: 将元素间的多个空白字符压缩成一个
        // condense: 将所有地方的空白字符压缩成一个
        config.module
            .rule("vue")
            .use("vue-loader")
            .loader("vue-loader")
            .tap(options => {
                options.compilerOptions.whitespace = "preserve";
                return options;
            })
            .end();
    },
    css: {
        sourceMap: false,
        loaderOptions: {
            scss: {
                additionalData: `@import "~@/variables.scss";`
            }
        }
    },
    devServer: {
        allowedHosts: "all",
        http2: false,
        https: false,
        host: "0.0.0.0",
        hot: true,
        open: process.platform === "darwin",
        port: 8181,
        proxy: {
            "^/api": {
                target: process.env.VUE_APP_PROXY_TARGET,
                pathRewrite: {},
                ws: true,
                secure: false,
                changeOrigin: true
            }
        }
    },
    parallel: true,
    pwa: {},
    pluginOptions: {}
});
