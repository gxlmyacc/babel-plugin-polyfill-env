# babel-plugin-polyfill-env

[![NPM version](https://img.shields.io/npm/v/babel-plugin-polyfill-env.svg?style=flat)](https://npmjs.com/package/babel-plugin-polyfill-env) [![NPM downloads](https://img.shields.io/npm/dm/babel-plugin-polyfill-env.svg?style=flat)](https://npmjs.com/package/babel-plugin-polyfill-env)

Without any configuration options, babel-plugin-polyfill-env behaves exactly the same as babel-plugin-require-polyfill.

> However, we don't recommend using `polyfill-env` this way because it doesn't take advantage of it's greater capabilities of targeting specific browsers.

```json
{
  "plugins": ["polyfill-env"]
}
```

You can also configure it to only include the polyfill needed for the browsers you support. Compiling only what's needed can make your bundles smaller and your life easier.

This example only includes the polyfills needed for coverage of users > 0.25%, ignoring Internet Explorer 11 and Opera Mini.. We use [browserslist](https://github.com/ai/browserslist) to parse this information, so you can use [any valid query format supported by browserslist](https://github.com/ai/browserslist#queries).

```js
{
  "plugins": [
    ["polyfill-env", {
      "targets": {
        // The % refers to the global coverage of users from browserslist
        "browsers": [ ">0.25%", "not ie 11", "not op_mini all"]
      }
    }]
  ]
}
```

> You can also target individual versions of browsers instead of using a query with `"targets": { "chrome": "52" }`.

## Install

Using npm:

```sh
npm install --save-dev babel-plugin-polyfill-env
```

or using yarn:

```sh
yarn add babel-plugin-polyfill-env --dev
```
