if (!global._babelPolyfill) {
  var DEFINE_PROPERTY = "defineProperty";
  function define(O, key, value) {
    O[key] || Object[DEFINE_PROPERTY](O, key, {
      writable: true,
      configurable: true,
      value: value
    });
  }

  define(String.prototype, "padLeft", "".padStart);
  define(String.prototype, "padRight", "".padEnd);

  "pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function (key) {
    [][key] && define(Array, key, Function.call.bind([][key]));
  });
}

