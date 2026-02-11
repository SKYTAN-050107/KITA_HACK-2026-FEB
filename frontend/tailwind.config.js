/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'kita-green': '#10b981',
                'kita-blue': '#3b82f6',
            }
        },
    },
    plugins: [],
}
