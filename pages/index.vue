<template>
  <div>
    <!--
      <ScrollamaImplem />
    -->
    
    <TheCanvasMusic />

    <button @click="triggerSound">
      {{ playerText }} 
    </button>

  </div>
</template>

<script setup>
import * as Tone from 'tone';
const playerText = ref('play');
const initTone = ref(0);

let player;

// set up the array size of frequency which will be the number of lines
// pow of 2
const frequencyArraySize = useState('frequencyArraySize', () => Math.pow(2,13) );


const analyserDCMeter = useState('analyserDCMeter', () => {} );
const analyserMeter = useState('analyserMeter', () => {} );
const analyserFourier = useState('analyserFourier', () => {} ); 

function triggerSound() {

  if (initTone.value === 0) {
    // putting file into buffer
    const audioFile = "sounds/5.mp3";
    player = new Tone.Player(audioFile).toDestination();

    const tempDCMeter = new Tone.DCMeter();
    const tempMeter = new Tone.Meter();
    const tempFourier = new Tone.Analyser("fft", frequencyArraySize.value);
    tempFourier.smoothing = 0.00000001;
    
    player.connect(tempDCMeter);
    player.connect(tempMeter);
    player.connect(tempFourier);

    analyserDCMeter.value = tempDCMeter;
    analyserMeter.value = tempMeter;

    // waveform
    // The values in the array are normalized to a range between -1 and 1, where -1 represents the minimum amplitude (i.e. silence), 
    // and 1 represents the maximum amplitude (i.e. the loudest part of the audio signal).

    // fft

    // In this example, the Analyser is configured to use the "waveform" type, 
    // which means it will provide an array of amplitude values representing the waveform of the audio signal.

    // The FFT (Fast Fourier Transform) is a mathematical algorithm used to convert a time-domain signal 
    // (like an audio waveform) into its frequency-domain representation (i.e. a spectrum). 
    analyserFourier.value = tempFourier;

    player.loop=true;
    player.autostart=true;

    playerText.value = 'stop';
    initTone.value = 1;

    

  } else {
    if (playerText.value === 'play') {
      player.start();
      playerText.value = 'stop';
    } else {
      player.stop();
      playerText.value = 'play';
    }
  }

}

</script>

<style scoped>
button {
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