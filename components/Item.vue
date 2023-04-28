<template>
    <article class="hl-item" :class="{ 'is-disabled': item.comingsoon }" ref="itemElement">
        <div class="hl-item__top">
            <span class="hl-item__index hide-on-fullscreen">{{ pad(index, 2) }}</span>
            <IconPlay class="hide-on-fullscreen"/>
            <button class="hl-close-btn" @click="stop">Close</button>
        </div>

        <div class="hl-item__main">
            <Canvas :canvasId="`canvas-${item.id}`" />

            <audio
                v-if="item.songData.file"
                class="hidden"
                controls
                loop
                crossorigin="anonymous"
                :id="`audio-${item.songData.file}`"
                ref="audio"
                :src="`sounds/${item.songData.file}`"
            ></audio>
        </div>
        
        <div class="hl-item__bottom">
            <div v-if="item.songData" class="hl-item__title hide-on-fullscreen">
                <Marquee v-if="!item.comingsoon">
                    <span>{{ item.songData.song }}</span> <span>/</span> <span>{{ item.songData.artist }}</span> <span>/</span>
                </Marquee>
                <Marquee v-else>
                    <span>Coming soon</span> <span>/</span>
                </Marquee>
            </div>
        </div>
    </article>
</template>

<script setup>
// TODO: Refactor component to listen global itemActive
const itemActive = useState('itemActive');

const props = defineProps({
    index: {
        type: Number,
        default: 0
    },
    item: {
        type: Object,
        default: null
    },
    active: {
        type: Boolean,
        default: false
    },
})

const audio = ref(null)
const itemElement = ref(null)
const signals = useState('signals')

onMounted(() => {
    itemElement.value.addEventListener('click', play)
})

function play() {
    audio.value.play()
    itemElement.value.removeEventListener('click', play)

    signalsCapture(
      props.item.id,
      `audio-${props.item.songData.file}`
    );
}

function stop() {
    audio.value.pause()
    signals.value.id = null

    setTimeout(() => itemElement.value.addEventListener('click', play))
}

</script>