import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";

// Messages passed to toast() as `__someKey__` are resolved through the
// translation table so they respect the active language; anything else
// (e.g. inline validation errors) is shown verbatim.
function resolveMessage(raw, t) {
  const match = /^__(.+)__$/.exec(raw);
  return match ? t(match[1]) : raw;
}

export default function ToastContainer() {
  const { toasts } = useApp();
  const { t } = useTranslation();

  return (
    <div className="toast-wrap">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          {resolveMessage(toast.message, t)}
        </div>
      ))}
    </div>
  );
}
