<template>
  <div class="header">
    <div ref="title">Hello, world!</div>
  </div>
</template>

<script setup>
import { gsap } from 'gsap';

const title = ref(null);

onMounted(() => {
  const letters = title.value.textContent.split('');
  title.value.textContent = '';

  letters.forEach((letter, index) => {
    const span = document.createElement('span');
    span.textContent = letter;
    span.style.position = 'relative';
    span.style.top = '-20px';
    span.style.opacity = 0;
    title.value.appendChild(span);

    gsap.to(span, {
      duration: 0.2,
      opacity: 1,
      top: '0px',
      delay: index * 0.05,
      ease: 'gsap.Power3.easeIn'
    })
  })
})

</script>