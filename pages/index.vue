<template>
  <Pointer :text="playerText" />
  
  <main>
  <!--
      <ScrollamaImplem />
    -->
    
    <TheCanvasMusic @click="triggerSound" />

    <!--
      b7 / 
    -->
    <audio
      controls
      loop
      crossorigin="anonymous"
      id="audio"
      src="sounds/1.mp3"
    ></audio>


  </main>
</template>

<script setup>

// different type with Medya includes
// rms from 0 to 1
// https://meyda.js.org/audio-features

import * as Medya from 'meyda';

const playerText = ref('play');
const initTone = ref(0);

let player;

// set up the array size of frequency which will be the number of lines
// pow of 2
const frequencyArraySize = useState('frequencyArraySize', () => Math.pow(2,13) );
const analyserDCMeter = useState('analyserDCMeter', () => {} );
const analyserMeter = useState('analyserMeter', () => {} );
const analyserFourier = useState('analyserFourier', () => {} ); 
const analyserCentroid = useState('analyserCentroid', () => {} );

let audio;

function triggerSound() {
  if (playerText.value === 'play') {
    playerText.value = 'pause';
    audio.play();
  } else {
    playerText.value = 'play';
    audio.pause();
  }
}

onMounted(() => {
  audio = document.querySelector('audio');
  const audioContext = new AudioContext();
  const htmlAudioElement = document.getElementById("audio");
  // Create an "Audio Node" from the Audio Element
  const source = audioContext.createMediaElementSource(htmlAudioElement);
  // Connect the Audio Node to your speakers. Now that the audio lives in the
  // Audio Context, you have to explicitly connect it to the speakers in order to
  // hear it
  source.connect(audioContext.destination);

  const analyzer = Meyda.createMeydaAnalyzer({
    audioContext: audioContext,
    source: source,
    bufferSize: 512,
    featureExtractors: ["powerSpectrum", "spectralCentroid"],
    callback: (features) => {

      analyserFourier.value = features.powerSpectrum;
      analyserCentroid.value = features.spectralCentroid;

    },
  });
  analyzer.start();
})  

</script>


<style scoped>
audio {
  visibility: hidden;
}
</style>