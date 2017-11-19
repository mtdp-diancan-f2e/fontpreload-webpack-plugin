'use strict';

const defaultOptions = {
    rel: 'preload', // 预加载方式， 默认preload
    fontNameList: ['fontawesome-webfont'], // 自定义的webfont字体名
    fileBlacklist: [/\.map/], // 需要剔除的文件后缀
};

class FontPreloadPlugin {
    constructor(options) {
        this.options = Object.assign({}, defaultOptions, options);
    }

    apply(compiler) {
        const options = this.options;
        compiler.plugin('compilation', (compilation) => {
            const publicPath = compilation.outputOptions.publicPath || '';
            compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, cb) => {
                let filesToInclude = [];
                if (compilation.assets && options.fontNameList.length) {
                    filesToInclude = Object.keys(compilation.assets).filter((assetName) => {
                        const nameMatch = options.fontNameList.find((fontName) => {
                            return assetName.indexOf(fontName) > -1;
                        });
                        if (nameMatch
                && options.fileBlacklist.every(regex => regex.test(assetName) === false)) {
                            return true;
                        }
                        return false;
                    }).map((assetName) => {
                        return `<link rel="${options.rel || 'preload'}" href="${publicPath}${assetName}" >`;
                    });
                }
                if (filesToInclude.length > 0) {
                    if (htmlPluginData.html.indexOf('</head>') !== -1) {
                        // If a valid closing </head> is found, update it to include preload/prefetch tags
                        htmlPluginData.html = htmlPluginData.html.replace('</head>', filesToInclude.join('') + '</head>');
                    } else {
                        // Otherwise assume at least a <body> is present and update it to include a new <head>
                        htmlPluginData.html = htmlPluginData.html.replace('<body>', '<head>' + filesToInclude.join('') + '</head><body>');
                    }
                }
                cb(null, htmlPluginData);
            });
        });
    }
}

module.exports = FontPreloadPlugin;
