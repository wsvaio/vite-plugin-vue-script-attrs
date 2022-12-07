# vite-plugin-vue-script-attrs
移动setup script标签上的属性到一个新的script标签内导出，只有attrNames指定的属性名才会被移动

# EXAMPLE
1. install
```
npm install -D vite-plugin-vue-script-attrs
```
2. config
```typescript
// vite.config.ts
...
import scriptAttrs from "vite-plugin-vue-script-attrs";
...
  plugins: [
    vue(),
    scriptAttrs({
      // 指定要移动的属性名
      attrNames: ["name", "inheritAttrs", "a"], // default = ["name"]
      // 当组件的文件名为index.vue时，自动读取父文件夹的名称作为组件名，优先级低
      autoName: true // default = false
    }) 
  ],
...
```
3. IN
```vue
<script setup lang="ts" name="home" inheritAttrs="true" a="a" b="b" c="c">

</script>

<template>
  <h1>Hello World !</h1>

</template>
```

4. OUT
```vue   
<script lang="ts">export default { name: "home", inheritAttrs: true, a: "a" }</script><!-- generate by vite-plugin-vue-script-attrs -->
<script setup lang="ts" b="b" c="c">import { ref } from 'vue';

const num = ref(0);
</script>

<template>
  <h1>Hello World !</h1>

</template>
```