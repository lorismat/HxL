<template>
  <Pointer :text="playerText" />
  <IndexTable />
  
  <main>    
    <Canvas1 v-if="cv == 1" @click="triggerSound" id="c-3843920043893" />
    <Canvas2 v-if="cv == 2" @click="triggerSound" id="c-4754729020181" />
    <Canvas3 v-if="cv == 3" @click="triggerSound" id="c-4858930288500" />
    <Canvas4 v-if="cv == 4" @click="triggerSound" id="c-8588993995054" />
    <Canvas5 v-if="cv == 5" @click="triggerSound" id="c-9000003294835" />
    <Canvas6 v-if="cv == 6" @click="triggerSound" id="c-8475923298212" />
    <Canvas7 v-if="cv == 7" @click="triggerSound" id="c-649204859568" />
    <Canvas8 v-if="cv == 8" @click="triggerSound" id="c-7685438291028" />
    <Canvas9 v-if="cv == 9" @click="triggerSound" id="c-8593847103947" />
    <Canvas10 v-if="cv == 10" @click="triggerSound" id="c-473201284953" />
    
    <!--
      b7 / 
    -->
    <audio
      controls
      loop
      crossorigin="anonymous"
      id="audio"
      :src="`sounds/nicolas-jaar/${activeAudio.file}.mp3`"
    ></audio>

  </main>
</template>

<script setup>
import * as Medya from 'meyda';

const playerText = ref('play');
const userAction = ref(0); // init value for conditional trigger of the sound

const signals = useState('signals', () => {
  return {
    arrSize: 128,
  }
}); 

const cv = useState('cv', () => {
  return 1;
});

const activeAudio = useState('activeAudio', () => {
  return {
    "file": "Wildflowers",
    "name": "Wildflowers"  
  }
});

const reqID = useState('reqID', () => {
  return 0;
});

let audio;

function triggerSound() {
  if (playerText.value === 'play') {

    if (userAction.value == 0) {
      audio = document.querySelector('audio');
      const audioContext = new AudioContext();
      const htmlAudioElement = document.getElementById("audio");
      const source = audioContext.createMediaElementSource(htmlAudioElement);
      const bufferSize = 256;
      source.connect(audioContext.destination);

      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: source,
        bufferSize: bufferSize, // 256
        featureExtractors: ["powerSpectrum", "rms", "zcr", "energy", "perceptualSpread", "spectralSpread", "chroma"],
        callback: (features) => {
          signals.value.powerSpectrum = features.powerSpectrum; // size: 128, arrValues between 0 and 44100/2 = 22050
          signals.value.rms = features.rms; // RMS is a positive floating point number, bound only by the length and volume of the input signal
          signals.value.zcr = features.zcr / ((bufferSize / 2) - 1); // value between (buffer size / 2) - 1, to clamp
          signals.value.energy = features.energy / bufferSize; // value between 0 and buffer size, to clamp
          signals.value.perceptualSpread = features.perceptualSpread; // 0 - 1
          signals.value.spectralSpread = features.spectralSpread / bufferSize / 2; // 0 - half of the FFT size. In Meyda the FFT size is equal to the buffer size
          
          // signals.value.chroma = features.chroma; // 12 values, 0 - 1
          // create an array where each value of the chroma array is repeated twice
          signals.value.chroma = features.chroma.flatMap((x) => [x, x]); // already normalized

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