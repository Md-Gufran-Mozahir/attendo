import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add aliases for react-bootstrap components for better resolution
      'react-bootstrap': path.resolve(__dirname, 'node_modules/react-bootstrap/esm'),
    }
  },
  optimizeDeps: {
    include: ['react-bootstrap', 'react-bootstrap/Button', 'react-bootstrap/Alert']
  }
})
