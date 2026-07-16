// src/plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#FF6B35',
          secondary: '#2D3436',
          accent: '#00B894',
          background: '#1A1A2E',
          surface: '#16213E',
          error: '#FF4757',
          success: '#2ED573',
          warning: '#FFA502',
        },
      },
    },
  },
})
