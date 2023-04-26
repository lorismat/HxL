<template>
    <div 
        class="hl-grid"
        :style="{ '--columns': numColumns }" 
        :setIndex="index = 0" 
        :setItem="item = 1">
        
        <div class="hl-grid__row" v-for="(row, rowIndex) in numRows" :key="rowIndex" ref="rows">
            <div
                class="hl-grid__cell" v-for="(column, columnIndex) in numColumns" 
                :class="{ 'is-disabled': isEmptyCell(index) || items[index].comingsoon }"
                :key="columnIndex" 
                :data-row="rowIndex" 
                :data-column="columnIndex"
                :data-index="index"
                ref="cells">
                
                <Item v-if="!isEmptyCell(index)" :item="items[index]" :index="item" />

                <div v-if="!isEmptyCell(index)" class="hidden" :setItem="item++" />
                <div class="hidden" :setIndex="index++" />
            </div>
        </div>
    </div>
</template>

<script setup>
import gsap from 'gsap'
import items from '@/data/items.json'

let wrapper = null
let storedScroll = 0



const numColumns = ref(0)
const numRows = ref(0)
const rows = ref([])
const cells = ref([])

// init signals captured in Item / to move in Setup?
const signals = useState('signals', () => {
  return {
    arrSize: 128,
    id: 0
  }
})

const reqId = useState('reqId', () => {
  return null
})

const cellSize = useState('cellSize', () => {
  return 0
})

onMounted(() => {
    wrapper = document.querySelector('.hl-main')
    setupCells()
    window.addEventListener('resize', onResize)
})

onUnmounted(() => {
    cells.value.forEach(element => element.removeEventListener('click', onCellClick))
    window.removeEventListener('resize', onResize)
})

function setupCells() {
    if (win.w < 600) {
        numColumns.value = 2
        numRows.value = Math.ceil((items.length / numColumns.value))
    } else if (win.w < 1200) {
        numColumns.value = 3
        numRows.value = Math.ceil((items.length / numColumns.value))
    } else {
        numColumns.value = 4
        numRows.value = Math.ceil((items.length / numColumns.value))
    }
    
    nextTick(() => {
        cellSize.value = (wrapper.getBoundingClientRect().width - numColumns.value) / numColumns.value
        console.log(cellSize.value);
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
    wrapper.classList.add('transition-active')
    cell.el.classList.add('transition-active')
    cell.el.querySelector('.hl-item').classList.add('transition-active')
    
    const closeBtn = cell.el.querySelector('.hl-close-btn')

    const row = rows.value[cell.row]
    const column = cell.column

    const duration = .6
    const ease = 'expo.out'
    
    gsap.set(wrapper, { overflow: 'hidden' })
    storedScroll = wrapper.scrollTop
    
    const tl = gsap.timeline({
        onComplete: () => {
            closeBtn.addEventListener('click', onCloseClick)

            wrapper.classList.remove('transition-active')
            cell.el.classList.remove('transition-active')
            cell.el.querySelector('.hl-item').classList.remove('transition-active')

            wrapper.classList.add('is-fullscreen')
            cell.el.classList.add('is-fullscreen')
            cell.el.querySelector('.hl-item').classList.add('is-fullscreen')
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
        scrollTop: cellSize.value * cell.row + cell.row,
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

    wrapper.classList.add('transition-active')
    cell.el.classList.add('transition-active')
    cell.el.querySelector('.hl-item').classList.add('transition-active')

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
    
            wrapper.classList.remove('is-fullscreen', 'transition-active')
            cell.el.classList.remove('is-fullscreen', 'transition-active')
            cell.el.querySelector('.hl-item').classList.remove('is-fullscreen', 'transition-active')
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

function isEmptyCell(cell) {
    return cell > items.length - 1 || !Object.keys(items[cell]).length
}

function onResize() {
    cells.value.forEach(element => element.removeEventListener('click', onCellClick))
    setupCells()
}
</script>