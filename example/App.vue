<script setup lang="ts" name="home" inheritAttrs="true" a="a" b="b" c="c" tag="div" :class="['admin', layout, collapse && 'collapse']" :style="{ '--aside-width': asideWidth }">
import { ref } from 'vue';
import iii from "./index.vue";

const num = ref(0);
</script>

<template>
  <h1>Hello World !</h1>
  <h2>{{ num }}</h2>
  <iii></iii>

</template>