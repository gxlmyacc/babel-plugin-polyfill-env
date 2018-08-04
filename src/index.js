"use strict";

function requireStatement (t, path) {
  return t.expressionStatement(t.callExpression(t.identifier('require'), [t.stringLiteral(path)]));
}

var browserNameMap = {
  android: "android",
  chrome: "chrome",
  and_chr: "chrome",
  edge: "edge",
  firefox: "firefox",
  ie: "ie",
  ios_saf: "ios",
  safari: "safari",
};
function semverify (semver, version) {
  if (typeof version === "string" && semver.valid(version)) {
    return version;
  }
  var split = version.toString().split(".");
  while (split.length < 3) split.push(0);
  return split.join(".");
};
function semverMin (semver, first, second) {
  return first && semver.lt(first, second) ? first : second;
};
function getLowestVersions (semver, browsers) {
  return browsers.reduce(function (all, browser) {
    var [browserName, browserVersion] = browser.split(" ");
    var normalizedBrowserName = browserNameMap[browserName];

    if (!normalizedBrowserName) return all;
    try {
      // Browser version can return as "10.0-10.2"
      var splitVersion = browserVersion.split("-")[0];
      var parsedBrowserVersion = semverify(semver, splitVersion);
      all[normalizedBrowserName] = semverMin(semver, all[normalizedBrowserName], parsedBrowserVersion);
    } catch (e) {}

    return all;
  }, {});
};

function getSHIMS () {
  var fs = require('fs');
  var shims = [];
  var content = fs.readFileSync(require.resolve('core-js/shim'), 'utf8');
  content.replace(/require\(\'\.\/modules\/([\w|\d|\.|\-]+)\'\)\;/g, function (_, c) {
    shims.push(c);
    return '';
  });
  return shims;
}

// function callCoreShim (t, browsers) {
//   var browserslist = require('browserslist');
//   var builtInsList = require('babel-preset-env/data/built-ins');
//   var semver = require('babel-preset-env/node_modules/semver');
//   var path = require('path');
//   var coreJsModules = path.join(require.resolve('core-js/modules/_core'), '../');
//   var targetOpts = getLowestVersions(semver, browserslist(browsers));
//   var shims = getSHIMS();
//   var blockStatements = [];
//   shims.forEach(function (shim) {
//     var stats = builtInsList[shim];
//     if (!stats) {
//       return /^web\./.test(shim) && blockStatements.push(requireStatement(t, path.join(coreJsModules, shim)));
//     }
//     var isSupported = Object.keys(targetOpts).every(function (browserName) {
//       var browserVersion = targetOpts[browserName];
//       var lowestVersion = semverify(semver, stats[browserName]);
//       return semverMin(semver, browserVersion, lowestVersion) === lowestVersion;
//     });
//     if (!isSupported) blockStatements.push(requireStatement(t, path.join(coreJsModules, shim)));
//   });
//   return blockStatements;
// }

function isSupported (semver, targetOpts, stats) {
  return Object.keys(targetOpts).every(function (browserName) {
    var browserVersion = targetOpts[browserName];
    var lowestVersion = semverify(semver, stats[browserName]);
    return semverMin(semver, browserVersion, lowestVersion) === lowestVersion;
  });
}
function callRegenerator (t, semver, targetOpts, blockStatements) {
  var stats = {
    "chrome": "50",
    "edge": "13",
    "firefox": "53",
    "safari": "10",
    "node": "6",
    "ios": "10",
    "opera": "37",
    "electron": "1.1"
  };
  if (!isSupported(semver, targetOpts, stats))
    blockStatements.push(requireStatement(t, 'regenerator-runtime/runtime'));
}
function callCoreShim (t, browsers) {
  var browserslist = require('browserslist');
  var builtInsList = require('babel-preset-env/data/built-ins');
  var semver = require('babel-preset-env/node_modules/semver');
  var path = require('path');
  var coreJsModules = 'core-js/modules/';
  var targetOpts = getLowestVersions(semver, browserslist(browsers));
  var shims = getSHIMS();
  var blockStatements = [];
  Object.keys(builtInsList).forEach(function (shim) {
    if (!~shims.indexOf(shim)) return;
    var stats = builtInsList[shim];
    if (!isSupported(semver, targetOpts, stats)) blockStatements.push(requireStatement(t, path.join(coreJsModules, shim)));
  });
  shims.forEach(function (shim) {
    if (/^web\./.test(shim)) blockStatements.push(requireStatement(t, path.join(coreJsModules, shim)));
  });
  callRegenerator(t, semver, targetOpts, blockStatements);
  return blockStatements;
}

function _polyfill (t, browsers) {
  return t.blockStatement(callCoreShim(t, browsers).concat([
    t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier('global'), t.identifier('_babelPolyfill')), t.booleanLiteral(true)))
  ].filter(Boolean)));
}

module.exports = function (babel) {
  var t = babel.types;
  var BABEL_PLUGIN_POLYFILL_ENV = false;
  return {
    visitor: {
      Program: function (path, state) {
        if (BABEL_PLUGIN_POLYFILL_ENV) return;
        var opts = state.opts || {};
        var browsers = opts.targets && opts.targets.browsers;
        path.unshiftContainer('body', t.ifStatement(
          t.unaryExpression('!', t.memberExpression(t.identifier('global'), t.identifier('_babelPolyfill')), true),
          browsers ? _polyfill(t, browsers) : requireStatement(t, 'babel-polyfill')
        ));
        BABEL_PLUGIN_POLYFILL_ENV = true;
      }
    }
  };
};

module.exports.__esModule = true;
module.exports['default'] = module.exports;
