<template>
    <article class="hl-item" :class="{ 'is-disabled': item.comingsoon }">
        <div class="hl-item__top">
            <span class="hl-item__index hide-on-fullscreen">{{ pad(index, 2) }}</span>
            <IconPlay class="hide-on-fullscreen"/>
            <button class="hl-close-btn">Close</button>
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
defineProps({
    index: {
        type: Number,
        default: 0
    },
    item: {
        type: Object,
        default: null
    }
})
</script>