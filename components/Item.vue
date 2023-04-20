<template>
    <article class="hl-item" :class="{ 'is-disabled': item.comingsoon }" ref="itemElement">
        <div class="hl-item__top">
            <span class="hl-item__index hide-on-fullscreen">{{ pad(index, 2) }}</span>
            <IconPlay class="hide-on-fullscreen"/>
            <button class="hl-close-btn" @click="stopSound">Close</button>
        </div>

        <div class="hl-item__main">
            <Canvas :canvasId="item.canvas" />

            <audio
                v-if="item.songData.file"
                class="hidden"
                controls
                loop
                crossorigin="anonymous"
                id="audio"
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
const props = defineProps({
    index: {
        type: Number,
        default: 0
    },
    item: {
        type: Object,
        default: null
    }
})

const audio = ref(null)
const itemElement = ref(null)

onMounted(() => {
    itemElement.value.addEventListener('click', playSound)
})

function playSound() {
    audio.value.play()
    itemElement.value.removeEventListener('click', playSound)
}

function stopSound() {
    audio.value.pause()
    setTimeout(() => itemElement.value.addEventListener('click', playSound))
}
</script>