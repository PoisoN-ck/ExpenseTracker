import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import svgr from 'vite-plugin-svgr';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.js'],
        css: false,
        alias: {
            '@': resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@hooks': resolve(__dirname, 'src/hooks'),
            '@types': resolve(__dirname, 'src/types'),
            '@constants': resolve(__dirname, 'src/constants'),
            '@img': resolve(__dirname, 'src/img'),
            '@utils': resolve(__dirname, 'src/utils'),
            '@context': resolve(__dirname, 'src/context'),
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: ['node_modules/', 'src/setupTests.js'],
        },
    },
    publicDir: 'public',
    plugins: [
        svgr(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@hooks': resolve(__dirname, 'src/hooks'),
            '@types': resolve(__dirname, 'src/types'),
            '@constants': resolve(__dirname, 'src/constants'),
            '@img': resolve(__dirname, 'src/img'),
            '@utils': resolve(__dirname, 'src/utils'),
            '@context': resolve(__dirname, 'src/context'),
        },
    },
    build: {
        outDir: 'build', // for Firebase
        emptyOutDir: true,
    },
    server: {
        port: 3000,
        open: true,
    },
});
