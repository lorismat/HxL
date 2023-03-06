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

import * as Medya from 'meyda';

const playerText = ref('play');
const analyserFourier = useState('analyserFourier', () => {} ); 
const analyserCentroid = useState('analyserCentroid', () => {} );
let audio;

function triggerSound() {
  if (playerText.value === 'play') {
    console.log(userAction.value);
    if (userAction.value == 0) {

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
      userAction.value += 1;
    }
    playerText.value = 'pause';
    audio.play();
    
  } else {
    playerText.value = 'play';
    audio.pause();
  }
}

const userAction = ref(0);

watch(() => userAction.value, () => {
  
  
})

</script>


<style scoped>
audio {
  visibility: hidden;
}
</style>