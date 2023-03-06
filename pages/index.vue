<template>
  <Pointer :text="playerText" />
  
  <main>
    
    <Canvas1 @click="triggerSound" />

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
import * as Medya from 'meyda';

const playerText = ref('play');
const userAction = ref(0); // init value for conditional trigger of the sound

const analyserFourier = useState('analyserFourier', () => {} ); 
const analyserCentroid = useState('analyserCentroid', () => {} );
let audio;

function triggerSound() {
  if (playerText.value === 'play') {

    // below is the initial condition to wait for user interaction
    if (userAction.value == 0) {
      audio = document.querySelector('audio');
      const audioContext = new AudioContext();
      const htmlAudioElement = document.getElementById("audio");
      const source = audioContext.createMediaElementSource(htmlAudioElement);
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

      // increment userAction.value to prevent this conditional from running again
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