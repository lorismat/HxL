<template>
    <div class="hl-marquee" ref="wrapper">
        <div class="hl-marquee__content">
            <div class="hl-marquee__row" v-for="row in 2">
                <span class="hl-marquee__string" v-for="string in copies">
                    <slot />
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
const wrapper = ref(null)
const copies = ref(1)

onMounted(() => {
    setNecessaryCopies()
})

function setNecessaryCopies() {
    const wrapperWidth = wrapper.value.offsetWidth
    const stringWidth = wrapper.value.querySelector('.hl-marquee__string').offsetWidth
    copies.value = Math.ceil(wrapperWidth / stringWidth)
}
</script>