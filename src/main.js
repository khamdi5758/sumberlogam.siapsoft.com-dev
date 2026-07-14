import { createApp } from "vue";
import VueSelect from "vue-select";
import App from "./App.vue";
import store from "./store";
import router from "./router";
//import { createPinia } from 'pinia'
import Toast from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "devextreme/dist/css/dx.light.css";
// import VueCookies from 'vue3-cookies'
import "./style.css";
import "./css/welcome.css";
import "vue-select/dist/vue-select.css";
import { locale, loadMessages } from "devextreme/localization";

// Set the locale for DevExtreme
locale("id");
loadMessages({
  "id": {
    // Add your custom messages here
  }
});

const app = createApp(App);

// app.use(createPinia())
app.use(store);
app.use(router);
app.use(Toast);
app.component("v-select", VueSelect);
// app.use(VueCookies)
app.mount("#app");

export default app;
