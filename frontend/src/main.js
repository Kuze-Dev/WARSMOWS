import './assets/tailwind.css'
import './assets/global.css'
import '@fortawesome/fontawesome-free/css/all.css';
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast,{
    position: "top-center",
    transition: "Vue-Toastification__bounce",
    maxToasts: 1,
    newestOnTop: true,
    filterBeforeCreate: (toast, toasts) => {
        if (toasts.filter(
          t => t.type === toast.type
        ).length !== 0) {
          // Returning false discards the toast
          return false;
        }
        // You can modify the toast if you want
        return toast;
      }
  });

app.mount('#app')
