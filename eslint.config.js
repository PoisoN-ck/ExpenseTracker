import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
    pluginJs.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
        },
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            ...prettierConfig.rules,
            'prettier/prettier': 'error',
        },
        settings: {
            'import/resolver': {
                alias: {
                    map: [
                        ['@', './src'],
                        ['@components/*', './src/components/*'],
                        ['@hooks/*', './src/hooks/*'],
                        ['@types', './src/types'],
                        ['@constants', './src/constants'],
                        ['@img/*', './src/img/*'],
                        ['@utils', './src/utils'],
                    ],
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
                },
            },
        },
    },
    {
        files: ['**/*.jsx', '**/*.tsx'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react: pluginReact,
        },
        rules: {
            ...(pluginReact.configs && pluginReact.configs.recommended
                ? pluginReact.configs.recommended.rules
                : {}),
            ...(pluginReact.configs && pluginReact.configs['jsx-runtime']
                ? pluginReact.configs['jsx-runtime'].rules
                : {}),
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];
