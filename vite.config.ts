import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const isVercel = !!process.env.VERCEL
  const base = isVercel ? '/' : '/ConvertLab/'

  return {
    base,
    plugins: [react()],
  }
})
