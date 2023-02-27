_current state here to test scrollama implementation_  

**Branch for music analysis: `meyda-music-analysis`**

# HxL

- `npm i && npm run dev`

# Spec info

- `nuxt3`
- `vue3` with Composition API
- store with [useState](https://nuxt.com/docs/getting-started/state-management) from `nuxt3`. Example wit `scrollVal` defined in `pages/index.vue`, updated in `components/ScrollamaImplem.vue` with `scrollVal.value = res.progress;` and used in `components/TheCanvas.vue` with `increment = THREE.MathUtils.lerp(0, Math.PI * 2, scrollVal.value);` 
- VSCode extension `Vue VSCode Snippets v3.1.1` & `Vue Language Features Volar` (test: **v3-base-setup** and **v3onmounted**)
- Libraries: `gsap`, `threejs`, `scrollama`, `meyda` (for sound analysis)
- Global style in `assets/css/main.css`

# Extra tools

- https://www.npmjs.com/package/web-audio-analyser ??? probably down
- find list of lib: https://github.com/willianjusten/awesome-audio-visualization#readme

# Escoger

- CSS framework: `Tailwind` OR raw `css` OR `SCSS/Sass`

# Inspis

- [jazz computer](http://jazz.computer/)

# Resources
- [codedrops](https://tympanus.net/codrops/)
- blog from mattdesl [with frequency analysis](https://mattdesl.svbtle.com/audiograph)
- this process [shared for audio viz](https://lusion.co/work/kaos-logo-generator)

# Efectos

- cursor mask + cursor effect
- GSAP reveal
- Moving Text (left to right / reverse)
