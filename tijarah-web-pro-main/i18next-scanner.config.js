module.exports = {
  input: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.spec.{js,jsx}",
    "!./src/assets/translations/**",
    "!./node_modules/**/*",
  ],
  output: "./assets/translations",
  options: {
    debug: true,
    func: {
      list: ["i18next.t", "i18n.t", "t"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    // trans: {
    //   component: 'Trans',
    //   i18nKey: 'i18nKey',
    //   defaultsKey: 'defaults',
    //   extensions: ['.js', '.jsx'],
    //   fallbackKey: function (ns, value) {
    //     return value;
    //   },
    //   acorn: {
    //     ecmaVersion: 10, // defaults to 10
    //     sourceType: 'module', // defaults to 'module'
    //     // Check out https://github.com/acornjs/acorn/tree/master/acorn#interface for additional options
    //   },
    // },
    lngs: ["ar", "en", "ur"],
    ns: [],
    defaultLng: "ar",
    defaultNs: "resource",
    defaultValue: (lng, ns, key) => {
      if (lng === "en") return key;
      if (lng === "ur") return `${key}.ur`;
      return `${key}.ar`;
    },
    resource: {
      loadPath: "{{lng}}.json",
      savePath: "{{lng}}.json",
      jsonIndent: 2,
      lineEnding: "\n",
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: "{{",
      suffix: "}}",
    },
  },
};
