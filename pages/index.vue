<template>
  <div>
    <!--
      <ScrollamaImplem />
    -->
    
    <TheCanvasMusic />

    <audio
      controls
      loop
      crossorigin="anonymous"
      id="audio"
      src="sounds/5.mp3"
    ></audio>


  </div>
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

onMounted(() => {
  const audioContext = new AudioContext();
  // Select the Audio Element from the DOM
  const htmlAudioElement = document.getElementById("audio");
  // Create an "Audio Node" from the Audio Element
  const source = audioContext.createMediaElementSource(htmlAudioElement);
  // Connect the Audio Node to your speakers. Now that the audio lives in the
  // Audio Context, you have to explicitly connect it to the speakers in order to
  // hear it
  source.connect(audioContext.destination);

  if (typeof Meyda === "undefined") {
    console.log("Meyda could not be found! Have you included it?");
  } else {
    const analyzer = Meyda.createMeydaAnalyzer({
      audioContext: audioContext,
      source: source,
      bufferSize: 512,
      featureExtractors: ["powerSpectrum"],
      callback: (features) => {
        console.log(features);

        analyserFourier.value = features.powerSpectrum;

      },
    });
    analyzer.start();
  }

})  

</script>

<style scoped>
audio {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  padding: 6px 12px;
  font-family: monospace;
  margin:30px;
  background-color: #333;
  color:#fff;
  border: 2px solid #fff;
  cursor: pointer;
  border-radius: 6px;
}
</style>