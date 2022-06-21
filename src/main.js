import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import mapPlugin from "./plugins/maps.js";
import Notifications from "@kyvg/vue3-notification";

createApp(App).use(mapPlugin).use(Notifications).mount("#app");
