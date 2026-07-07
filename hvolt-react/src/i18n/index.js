import { useApp } from "../context/AppContext.jsx";
import { TRANSLATIONS } from "./translations.js";

// useTranslation() — call inside any component to get a `t(key)` function
// bound to the app's current language. Keeps every component decoupled from
// how/where the language preference is stored.
export function useTranslation() {
  const { lang } = useApp();
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? key;
  return { t, lang };
}
