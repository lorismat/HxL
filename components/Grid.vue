<template>
    <div class="hl-grid">
        <div class="hl-grid__row" v-for="(row, index) in rows" :key="index">
            <div class="hl-grid__cell" v-for="(column, index) in columns" :key="index">
                <span>{{ pad(row, 2) }}_{{ pad(column, 2) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import gsap from 'gsap'

const columns = ref(4);
const rows = ref(4);

function pad(num, size) {
    return ('000000000' + num).substr(-size)
}

</script>