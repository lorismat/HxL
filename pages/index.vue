<template>
  <Pointer :text="playerText" />
  
  <main>
    
    <Canvas4 @click="triggerSound" />

    <!--
      b7 / 
    -->
    <audio
      controls
      loop
      crossorigin="anonymous"
      id="audio"
      src="sounds/2.mp3"
    ></audio>


  </main>
</template>

<script setup>
import * as Medya from 'meyda';

const playerText = ref('play');
const userAction = ref(0); // init value for conditional trigger of the sound

const signals = useState('signals', () => {
  return {
    arrSize: 32,
    powerSpectrum: []
  }
});

let audio;

function triggerSound() {
  if (playerText.value === 'play') {

    if (userAction.value == 0) {
      audio = document.querySelector('audio');
      const audioContext = new AudioContext();
      const htmlAudioElement = document.getElementById("audio");
      const source = audioContext.createMediaElementSource(htmlAudioElement);
      source.connect(audioContext.destination);

      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: source,
        bufferSize: Math.pow(2, 8),
        featureExtractors: ["powerSpectrum"],
        callback: (features) => {
          signals.value.powerSpectrum = features.powerSpectrum.filter((_, i) => i % 4 === 0);
        },
      });
      analyzer.start();
      userAction.value += 1;
    }
    playerText.value = 'pause';
    audio.play();
  } else {
    playerText.value = 'play';
    audio.pause();
  }
}

</script>


<style scoped>
audio {
  visibility: hidden;
}
</style>