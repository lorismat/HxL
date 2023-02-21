<template>
  <div>
    <div id="scrolly">
      <div id="container">
        <GSAPTest />
        <div id="loader">scroll</div>
      </div>
  </div>

  </div>
</template>

<script setup>

import scrollama from 'scrollama';

const scrollVal = useState('scrollVal');

const scroller = scrollama();

function handleStepProgress(res) {
  console.log(res.progress,res.element);
  document.getElementById("loader").innerText = res.progress;

  scrollVal.value = res.progress;
}



onMounted(() => {
  scroller
    .setup({
      step: "#scrolly",
      progress: true,
      threshold: 4 // The granularity of the progress interval in pixels (smaller = more granular). 1 to 10
    })
    .onStepProgress(handleStepProgress);
})

</script>

<style scoped>

#scrolly {
  position: relative;
  
  height:4000px;
  background-color: transparent;
  z-index: 10;
}

#container {
  color:#fff;
  font-family: monospace;
  position: sticky;
  top:0;
  width:100vw;
  height:100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

</style>
