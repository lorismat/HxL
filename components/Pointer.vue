<template>
  <div class="hl-pointer">
    <div class="hl-pointer__inner">{{ text }}</div>
  </div>
</template>

<script setup>
import gsap from 'gsap'

defineProps({
  text: {
    type: String,
    default: ''
  }
})

let el = null
let clientX = ref(0)
let clientY = ref(0)

function init() {
  el = document.querySelector('.hl-pointer')

  gsap.set(el, {
    x: clientX.value,
    y: clientY.value,
  })

  render()
}

function render() {
  gsap.to(el, {
    x: clientX.value,
    y: clientY.value,
    duration: .6,
    ease: 'power4.out', 
  })
  requestAnimationFrame(render)
}

function onMouseMove(e) {
  clientX.value = e.clientX
  clientY.value = e.clientY
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  init()
})

onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
})
</script>

<style scoped>
  .hl-pointer {
    position: fixed;
    pointer-events: none;
    opacity: 0;
    transition: opacity .3s;
  }
  body:hover .hl-pointer {
    opacity: 1;
  }
  .hl-pointer__inner {
    text-transform: uppercase;
  }
</style>