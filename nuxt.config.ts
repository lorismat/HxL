export default defineNuxtConfig({
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/main.scss" as *;'
        }
      }
    }
  },

  // components: [
  //   {
  //     path: '~/components',
  //     pathPrefix: false,
  //   },
  // ],
})