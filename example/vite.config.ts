import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import scriptAttrs from "../src"

export default defineConfig({
  plugins: [
    vue(),
    scriptAttrs({ attrNames: ["name", "inheritAttrs", "a"], autoName: true })
  ],
});
