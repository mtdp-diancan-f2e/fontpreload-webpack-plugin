'use strict';

const defaultOptions = {
    rel: 'preload', // 预加载方式， 默认preload
    fontNameList: ['fontawesome-webfont'], // 自定义的webfont字体名
    fileBlacklist: [/\.map/], // 需要剔除的文件后缀
    crossorigin: false, // 支持支持跨域，默认false
};

const extMappings = {
    eot: 'application/vnd.ms-fontobject',
    woff2: 'font/woff2',
    woff: 'font/woff',
    ttf: 'font/ttf',
    svg: 'image/svg+xml',
};

function getExt(assetName) {
    const lastIndex = assetName.lastIndexOf('.');
    if (lastIndex !== -1) {
        return assetName.substr(lastIndex + 1, assetName.length - lastIndex);
    }
    return '';
}

class FontPreloadPlugin {
    constructor(options) {
        this.options = Object.assign({}, defaultOptions, options);
    }

    apply(compiler) {
        const options = this.options;
        const extList = Object.keys(extMappings);
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
                            && extList.indexOf(getExt(assetName)) > -1
                            && options.fileBlacklist.every(regex => regex.test(assetName) === false)) {
                            return true;
                        }
                        return false;
                    }).map((assetName) => {
                            return `<link rel="${options.rel || 'preload'}" as="font" type=${extMappings[getExt(assetName)]} ${options.crossorigin ? 'crossorigin="anonymous"' : ''} href="${publicPath}${assetName}" >`;
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
