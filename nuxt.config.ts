import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  app: {
   pageTransition: { name: 'page', mode: 'out-in' }
 },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['@pinia/nuxt', 'nuxt-directus'],
  
  directus: {      
    url: process.env.DIRECTUS_URL,
    autoFetch: false,
  },
 
  runtimeConfig: {
    public: {
      directusUrl: process.env.DIRECTUS_URL,
    },
    
    redirects: false,
  },

});