import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { messages } from "./languages";

// Detectar idioma de forma segura con Español por defecto
let detectedLng = "es";
try {
  const stored = localStorage.getItem("i18nextLng");
  if (stored) {
    const short = stored.substring(0, 2);
    if (messages[short]) {
      detectedLng = short;
    }
  }
} catch (e) {
  // localStorage bloqueado - mantiene "es" como estándar
}

i18n
  .use(initReactI18next)
  .init({
    debug: false,
    lng: detectedLng,
    fallbackLng: "es",
    defaultNS: ["translations"],
    ns: ["translations"],
    resources: messages,
  });

// Salvar cambio de idioma cuando sea posible
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("i18nextLng", lng);
  } catch (e) {
    // storage bloqueado, ignora
  }
});

export { i18n };
