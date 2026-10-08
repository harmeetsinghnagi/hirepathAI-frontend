// This file configures Vite — the tool that runs our React project
// We are adding Tailwind CSS here so it works with our project

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),        // This makes React work
    tailwindcss(),  // This makes Tailwind CSS work
  ],
})