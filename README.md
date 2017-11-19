## Installation
```shell
npm install fontpreload-webpack-plugin --save-dev
```

## Usage
Add this plugin in your webpack config file.
```
const FontPreloadWebpackPlugin = require('webpack-fontpreload-plugin');
```

```
plugins: [
    new FontPreloadWebpackPlugin({
        rel: 'prefetch', // preload default
        fontNameList: ['fontawesome-webfont'],
    })
],

```