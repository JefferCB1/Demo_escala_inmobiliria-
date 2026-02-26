/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
theme: {
        extend: {
            fontFamily: {
                'sans': ['Inter', 'sans-serif'],
                'heading': ['Outfit', 'sans-serif'],
            },
colors: {
                // Changed to neutral dark colors (no blue)
                'escala-dark': '#1a1a1a', // Neutral dark gray/black
                'escala-accent': '#FF6B00', // Highly vibrant orange for primary CTAs
                'escala-warm1': '#f5f5f5', // Very light gray for subtle backgrounds
                'escala-warm2': '#e5e5e5', // Slightly darker gray for borders/accents
                'escala-light': '#ffffff'  // Pure white base
            },
            borderRadius: {
                'bento': '2rem',
                'bento-lg': '3rem'
            },
            animation: {
                'shimmer': 'shimmer 2.5s linear infinite',
                'slideUp': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'marquee': 'marquee 25s linear infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-150%) skewX(12deg)' },
                    '100%': { transform: 'translateX(250%) skewX(12deg)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }
        },
    },
    plugins: [],
}
