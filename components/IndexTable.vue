<template>
  <div class="index">
    <div 
      :id="song.id" 
      :data-number="song.number"
      :data-song="song.file" 
      :data-name="song.name" 
      class="el" v-for="song in songs"
      @click="playElement($event)" >
      {{ song.name }}
    </div>

    <NowPlaying :song="nowPlaying" class="now"/>
  </div>
</template>

<script setup>

const nowPlaying = ref('Leaves');
// create element array dynamically as function
const songs = [
  {
    "file": "01-Leaves",
    "name": "Leaves"
  }, 
  {
    "file": "02-Wildflowers",
    "name": "Wildflowers"
  }, 
  {
    "file": "03-No",
    "name": "No"
  }, 
  {
    "file": "04-Why-Didn-t-You-Save-Me",
    "name": "Why didn't you save me"
  }, 
  {
    "file": "05-Sunder",
    "name": "Sunder"
  }, 
  {
    "file": "06-America-I-m-for-the-Birds",
    "name": "America, I'm for the birds"
  }, 
  {
    "file": "07-Pass-the-Time",
    "name": "Pass the time"
  }, 
  {
    "file": "08-Tourists",
    "name": "Tourists"
  }, 
  {
    "file": "09-I-Got-a",
    "name": "I got a"
  }, 
];

songs.forEach((song, i) => {
  song.id = `el-${i+1}`;
  song.number = i+1;
});

function playElement(e) {
  const activeAudio = useState('activeAudio');
  nowPlaying.value = e.target.dataset.name;
  activeAudio.value = `sounds/nicolas-jaar/${e.target.dataset.song}.mp3`;
  const cv = useState('cv');
  cv.value = e.target.dataset.number;
}

</script>