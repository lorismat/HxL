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
import items from '@/data/items.json'

let wrapper = null
let storedScroll = 0
let cellSize = 0

const numColumns = ref(0)
const numRows = ref(0)
const rows = ref([])
const cells = ref([])

onMounted(() => {
    console.log(items)
  
    wrapper = document.querySelector('main')
    setupCells()
    window.addEventListener('resize', onResize)
})

onUnmounted(() => {
    cells.value.forEach(element => element.removeEventListener('click', onCellClick))
    window.removeEventListener('resize', onResize)
})

function setupCells() {
    if (window.innerWidth < 600) {
        numColumns.value = 2
        numRows.value = 8
    } else if (window.innerWidth < 1200) {
        numColumns.value = 3
        numRows.value = 6
    } else {
        numColumns.value = 4
        numRows.value = 4
    }
    
    nextTick(() => {
        cellSize = (wrapper.getBoundingClientRect().width - numColumns.value) / numColumns.value
        cells.value.forEach(element => element.addEventListener('click', onCellClick))
    })
}

function onCellClick(e) {
    cells.value.forEach(element => element.removeEventListener('click', onCellClick))
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
    cell.el.classList.add('is-fullscreen')
    wrapper.classList.add('is-fullscreen')

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
        x: -1* (wrapper.getBoundingClientRect().width/numColumns.value * column) - 1,
        duration: duration,
        ease: ease,
    }, 0)
    
    tl.to(cell.el, {
        width: wrapper.getBoundingClientRect().width + 2,
        minWidth: wrapper.getBoundingClientRect().width + 2,
        maxWidth: wrapper.getBoundingClientRect().width + 2,
        flexBasis: wrapper.getBoundingClientRect().width + 2,
        height: wrapper.getBoundingClientRect().height + 2,
        duration: duration,
        ease: ease,
    }, 0)

    tl.to(wrapper, {
        scrollTop: cellSize * cell.row + cell.row,
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
    const cellSize = wrapper.offsetWidth / numColumns.value
    const row = rows.value[cell.row]
    const column = cell.column

    const duration = .6
    const ease = 'expo.inOut'

    gsap.to(cell.el.querySelector('.hl-close-btn'), {
        autoAlpha: 0,
        duration: .2,
    })

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(wrapper, { overflow: '', overflowY: 'auto' })
            cells.value.forEach(element => element.addEventListener('click', onCellClick))

            gsap.set(cell.el, {
                width: '',
                minWidth: '',
                maxWidth: '',
                flexBasis: '',
                height: '',
            })

            cell.el.classList.remove('is-fullscreen')
            wrapper.classList.remove('is-fullscreen')
        }
    })

    tl.to(row, {
        x: 0,
        duration: duration,
        ease: ease,
    }, 0)
    
    tl.to(cell.el, {
        width: cellSize,
        minWidth: cellSize,
        maxWidth: cellSize,
        flexBasis: cellSize,
        height: cellSize,
        duration: duration,
        ease: ease,
    }, 0)

    tl.to(wrapper, {
        scrollTop: storedScroll,
        duration: duration,
        ease: ease,
    }, 0)
}

function onResize() {
    cells.value.forEach(element => element.removeEventListener('click', onCellClick))
    setupCells()
}
</script>