import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
    {
        ignores: [
            'node_modules/**',
            'build/**',
            'dist/**',
            'public/**',
            'coverage/**',
        ],
    },
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
                        ['@hooks', './src/hooks'],
                        ['@types', './src/types'],
                        ['@constants', './src/constants'],
                        ['@img/*', './src/img/*'],
                        ['@utils', './src/utils'],
                        ['@context/*', './src/context/*'],
                        ['@context', './src/context'],
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
            'react/prop-types': ['error', { ignore: ['children'] }],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        files: ['**/*.test.js', '**/*.test.jsx'],
        languageOptions: {
            globals: {
                vi: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
        rules: {
            'react/prop-types': 'off',
            'no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
];
