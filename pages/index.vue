<template>
  <Pointer :text="playerText" />
  <IndexTable />
  
  <main>
    <Canvas1 v-if="cv == 1" @click="triggerSound" id="c1" />
    <Canvas2 v-if="cv == 2" @click="triggerSound" id="c2" />
    <Canvas3 v-if="cv == 3" @click="triggerSound" id="c3" />
    <Canvas4 v-if="cv == 4" @click="triggerSound" id="c4" />
    <Canvas5 v-if="cv == 5" @click="triggerSound" id="c5" />
    <Canvas6 v-if="cv == 6" @click="triggerSound" id="c6" />
    <Canvas7 v-if="cv == 7" @click="triggerSound" id="c7" />
    <Canvas8 v-if="cv == 8" @click="triggerSound" id="c8" />
    <Canvas9 v-if="cv == 9" @click="triggerSound" id="c9" />
    <Canvas10 v-if="cv == 10" @click="triggerSound" id="c10" />

    <!--
      b7 / 
    -->
    <audio
      controls
      loop
      crossorigin="anonymous"
      id="audio"
      :src="activeAudio"
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

const cv = useState('cv', () => {
  return 1;
});

const activeAudio = useState('activeAudio', () => {
  return 'sounds/nicolas-jaar/01-Leaves.mp3';
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
          // signals.value.powerSpectrum = features.powerSpectrum.filter((_, i) => i % 4 === 0);
          signals.value.powerSpectrum = features.powerSpectrum.filter((_, i) => i % 1 === 0);
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