module.exports = {
    extends: "eslint:recommended",

    parser: "babel-eslint",
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 9,
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    globals: {
        __static: true
    },
    plugins: ["html"],
    rules: {
        'no-console': [0],
        'no-unused-vars': [0]
    }
};
