import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

const OUT_DIR = resolve(__dirname, 'dist');

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  build: {
    outDir: OUT_DIR,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'useWebWorker',
    },
    ssr: true,
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          dequal: 'dequal',
        },
      },
    },
  },
  plugins: [
    react(),
    dts({
      rollupTypes: true,
      outDir: OUT_DIR,
    }),
  ],
}));
