<template>
  <NuxtLayout>
    <Setup />
    <NuxtPage/>    
  </NuxtLayout>
</template>

<script setup>
useHead({
  htmlAttrs: {
    class: "theme-dark",
  },
});
</script>

<style lang="scss">
// Global style applied to all pages
</style>