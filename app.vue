<template>
  <NuxtLayout>
    <NuxtPage/>    
  </NuxtLayout>
</template>

<script setup>
useHead({
  htmlAttrs: {
    class: "theme-dark",
  },
});

onMounted(() => {
  // TODO: Load on app init
  win.w = window.innerWidth;
	win.h = window.innerHeight;

  isTouchDevice.value = "ontouchstart" in document.documentElement;
  window.addEventListener('resize', onResize);
})

function onResize() {
  win.w = window.innerWidth;
	win.h = window.innerHeight;
}
</script>

<style lang="scss">
// Global style applied to all pages
</style>