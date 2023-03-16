<template>
  <div>
    now: {{ props.song }}
  </div>
</template>

<script setup>

const props = defineProps({
  song: {
    type: String,
    required: true
  }
});

</script>