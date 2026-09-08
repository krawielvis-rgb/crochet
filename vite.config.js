import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        firstProject: resolve(import.meta.dirname, 'posts/first-crochet-project.html'),
        grannySquare: resolve(import.meta.dirname, 'posts/granny-square.html'),
        yarnGuide: resolve(import.meta.dirname, 'posts/yarn-guide.html'),
        amigurumi: resolve(import.meta.dirname, 'posts/amigurumi.html')
      }
    }
  }
})
