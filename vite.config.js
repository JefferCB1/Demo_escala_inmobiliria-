import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './vite-api-plugin.js'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), apiPlugin()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-gsap': ['gsap', '@gsap/react'],
                    'vendor-helmet': ['react-helmet-async'],
                },
            },
        },
    },
})
