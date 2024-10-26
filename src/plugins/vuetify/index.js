import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import defaults from './defaults'
import { icons } from './icons'
import { themes } from './theme'

// Styles
import '@core/scss/template/libs/vuetify/index.scss'
import 'vuetify/styles'

export default function (app) {
  const vuetify = createVuetify({
    aliases: {
      IconBtn: VBtn,
    },
    defaults,
    icons,
    theme: {
      defaultTheme: 'light',
      themes,
    },
    // locale: {
    //   locale: 'en-MY',
    // },
    // Reason to enable: use correct date type inside Date Inputs.
    // Reason to disable: weird issue of internationalization.
    // TODO: wait for vuetify to release feature to change date format
  })

  app.use(vuetify)
}
