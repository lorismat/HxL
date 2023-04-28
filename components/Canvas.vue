<template>
  <div>
    <CanvasCanvas1 v-if="props.canvasId === 'canvas-1'" :id="`${props.canvasId}`"  />
    <CanvasCanvas2 v-if="props.canvasId === 'canvas-2'" :id="`${props.canvasId}`"  />
    
    <!-- 
      <CanvasCanvas3 v-if="props.canvasId === 3" :id="`canvas-${props.canvasId}`"  />
      <CanvasCanvas4 v-if="props.canvasId === 4" :id="`canvas-${props.canvasId}`"  />
    -->
    
  </div>
</template>

<script setup>

const reqId = useState('reqId');
const signals = useState('signals');
const cellSize = useState('cellSize');

const props = defineProps({
  canvasId: {
    type: String,
    default: null
  }
})


</script>