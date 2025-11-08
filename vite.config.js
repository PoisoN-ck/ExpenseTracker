import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    publicDir: 'public',
    plugins: [
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
    ],
    build: {
        outDir: 'build', // for Firebase
        emptyOutDir: true,
    },
    server: {
        port: 3000,
        open: true,
    },
});
