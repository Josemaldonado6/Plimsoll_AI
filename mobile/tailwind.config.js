/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                plimsoll: {
                    navy: '#0a192f',
                    lightnavy: '#112240',
                    cyan: '#64ffda',
                    slate: '#8892b0',
                    white: '#e6f1ff',
                }
            }
        },
    },
    plugins: [],
}
