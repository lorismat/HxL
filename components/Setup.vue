<template>
    <slot />
</template>

<script setup>
// Initial setup functions

onMounted(() => {
    win.w = window.innerWidth;
    win.h = window.innerHeight;

    isTouchDevice.value = "ontouchstart" in document.documentElement;
    window.addEventListener('resize', onResize);
})

onUnmounted(() => {
    window.removeEventListener('resize', onResize);
})

function onResize() {
    win.w = window.innerWidth;
	win.h = window.innerHeight;
}
</script>