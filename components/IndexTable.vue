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

const activeAudio = useState('activeAudio');
const nowPlaying = ref(activeAudio.value.name);

// create element array dynamically as function
const songs = [
  {
    "file": "Wildflowers",
    "name": "Wildflowers"
  }, 
  {
    "file": "No",
    "name": "No"
  },
  {
    "file": "Sunder",
    "name": "Sunder"
  }, 
  {
    "file": "America-I-m-for-the-Birds",
    "name": "America, I'm for the birds"
  }, 
  {
    "file": "Leaves",
    "name": "Leaves"
  },
  {
    "file": "Fight",
    "name": "Fight"
  },
  {
    "file": "Pass-the-Time",
    "name": "Pass The Time"
  },
  {
    "file": "Problem-with-the-sun",
    "name": "Problem With The Sun"
  },
  {
    "file": "Mi-Mujer",
    "name": "Mi Mujer"
  },
  {
    "file": "No-one-is-looking-at-U",
    "name": "No One is Looking at U"
  },
];

songs.forEach((song, i) => {
  song.id = `el-${i+1}`;
  song.number = i+1;
});

function playElement(e) {
  nowPlaying.value = e.target.dataset.name;
  activeAudio.value.file = e.target.dataset.song;
  activeAudio.value.name = e.target.dataset.name;
  const cv = useState('cv');
  cv.value = e.target.dataset.number;
}

</script>