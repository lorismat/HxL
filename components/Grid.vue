<template>
    <div class="hl-grid" :style="{ '--columns': numColumns }" :set="counter = 1">
        <div class="hl-grid__row" v-for="(row, rowIndex) in numRows" :key="rowIndex" ref="rows">
            <div 
                class="hl-grid__cell" v-for="(column, columnIndex) in numColumns" 
                :key="columnIndex" 
                ref="cells" 
                :data-row="rowIndex" 
                :data-column="columnIndex"
                :data-index="counter">

                <span class="hl-grid__cell__index">{{ pad(counter++, 2) }}</span>
                <button class="hl-close-btn">Close</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import gsap from 'gsap'

let wrapper = null
let storedScroll = 0

const numColumns = ref(4)
const numRows = ref(4)
const rows = ref([])
const cells = ref([])

onMounted(() => {
    wrapper = document.querySelector('main')

    cells.value.forEach(element => element.addEventListener('click', onCellClick))
})

function onCellClick(e) {
    const cellElement = e.target.closest('.hl-grid__cell')
    const cell = {
        el: cellElement,
        row: parseInt(cellElement.dataset.row),
        column: parseInt(cellElement.dataset.column),
        index: parseInt(cellElement.dataset.index),
    }

    goFullscreen(cell)
}

function goFullscreen(cell) {
    cell.el.removeEventListener('click', onCellClick)
    cell.el.classList.add('is-fullscreen')

    const cellWidth = wrapper.offsetWidth / numColumns.value
    const row = rows.value[cell.row]
    const column = cell.column

    const duration = .6
    const ease = 'expo.out'
    
    gsap.set(wrapper, { overflow: 'hidden' })
    storedScroll = wrapper.scrollTop
    const closeBtn = cell.el.querySelector('.hl-close-btn')
    gsap.set(closeBtn, { autoAlpha: 0 })
    
    const tl = gsap.timeline({
        onComplete: () => {
            closeBtn.addEventListener('click', onCloseClick)
            gsap.to(closeBtn, { autoAlpha: 1, 
                duration: .3,
            })
        }
    })

    tl.to(row, {
        x: -1* (cellWidth * column) - 1,
        duration: duration,
        ease: ease,
    }, 0)
    
    tl.to(cell.el, {
        width: (cellWidth * numColumns.value) + 2,
        minWidth: (cellWidth * numColumns.value) + 2,
        maxWidth: (cellWidth * numColumns.value) + 2,
        flexBasis: (cellWidth * numColumns.value) + 2,
        height: wrapper.offsetHeight + 2,
        duration: duration,
        ease: ease,
    }, 0)

    tl.to(wrapper, {
        scrollTop: cellWidth * cell.row + 1,
        duration: duration,
        ease: ease,
    }, 0)
}

function onCloseClick(e) {
    e.target.closest('.hl-close-btn').removeEventListener('click', onCloseClick)

    const cellElement = e.target.closest('.hl-grid__cell')
    const cell = {
        el: cellElement,
        row: parseInt(cellElement.dataset.row),
        column: parseInt(cellElement.dataset.column),
        index: parseInt(cellElement.dataset.index),
    }

    exitFullscreen(cell)
}

function exitFullscreen(cell) {
    cell.el.classList.remove('is-fullscreen')
    
    const cellWidth = wrapper.offsetWidth / numColumns.value
    const row = rows.value[cell.row]
    const column = cell.column

    const duration = .6
    const ease = 'expo.out'

    const tl = gsap.timeline({
        onComplete: () => {
            cells.value.forEach(element => {
                element.addEventListener('click', onCellClick)
                gsap.set(wrapper, { overflow: '', overflowY: 'auto' })
            })

            gsap.set(cell.el, {
                width: '',
                minWidth: '',
                maxWidth: '',
                flexBasis: '',
                height: '',
            })
        }
    })

    tl.to(row, {
        x: 0,
        duration: duration,
        ease: ease,
    }, 0)
    
    tl.to(cell.el, {
        width: cellWidth,
        minWidth: cellWidth,
        maxWidth: cellWidth,
        flexBasis: cellWidth,
        height: cellWidth,
        duration: duration,
        ease: ease,
    }, 0)

    tl.to(wrapper, {
        scrollTop: storedScroll,
        duration: duration,
        ease: ease,
    }, 0)
}

// TODO: To global utils
function pad(num, size) {
    return ('000000000' + num).substr(-size)
}
</script>