<template>
    Canvas id: {{ canvasId }}
</template>

<script setup>
// console.log(win)

const props = defineProps({
    canvasId: {
        type: Number,
        default: 0
    },
})
</script>