import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=youtube.com',
        namespace: 'npm/vite-plugin-monkey',
        match: ['https://www.youtube.com/*'],
      },
      server: { mountGmApi: true },
    }),
  ],
});
