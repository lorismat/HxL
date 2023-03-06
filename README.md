# HxL

# Spec info

- `nuxt3`
- `vue3` with Composition API
- store with [useState](https://nuxt.com/docs/getting-started/state-management) from `nuxt3`. Example wit `scrollVal` defined in `pages/index.vue`, updated in `components/ScrollamaImplem.vue` with `scrollVal.value = res.progress;` and used in `components/TheCanvas.vue` with `increment = THREE.MathUtils.lerp(0, Math.PI * 2, scrollVal.value);` 
- VSCode extension `Vue VSCode Snippets v3.1.1` & `Vue Language Features Volar` (test: **v3-base-setup** and **v3onmounted**)
- Libraries: `gsap`, `threejs`, `scrollama`, `Meyda`
- Global style in `assets/scss/main.scss` / leave the `app.vue` style as comment

# Inspis

- [Pinterest Tablero](https://www.pinterest.es/hermesgrau/music-player-references/)

# Resources
- [codedrops](https://tympanus.net/codrops/)

# Visualising sounds tutorial

- Blog from Mattdesl [with frequency analysis](https://mattdesl.svbtle.com/audiograph)
- Blog from Visual Cinnamon [here](https://www.visualcinnamon.com/2020/06/sony-music-data-art/#final-result-animated-poster)