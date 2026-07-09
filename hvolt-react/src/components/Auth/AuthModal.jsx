import { useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";

export default function AuthModal() {
  const { authModal, setAuthModal } = useApp();
  if (!authModal) return null;

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setAuthModal(null);
      }}
    >
      <div className="modal">
        <button className="modal-close" onClick={() => setAuthModal(null)}>
          ×
        </button>
        {authModal === "login" && <LoginForm />}
        {authModal === "register" && <RegisterForm />}
        {authModal === "forgot" && <ForgotForm />}
      </div>
    </div>
  );
}

function LoginForm() {
  const { login, setAuthModal } = useApp();
  const { t } = useTranslation();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  return (
    <>
      <h2>{t("loginTitle")}</h2>
      <p className="sub">{t("loginSub")}</p>
      <div className="field">
        <label>{t("email")}</label>
        <input ref={emailRef} type="email" placeholder="you@example.com" />
      </div>
      <div className="field">
        <label>{t("password")}</label>
        <input ref={passwordRef} type="password" placeholder="••••••••" />
      </div>
      <button
        className="btn btn-primary"
        style={{ width: "100%", marginBottom: 10 }}
        onClick={() => login(emailRef.current.value, passwordRef.current.value)}
      >
        {t("login")}
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <button className="link-btn" onClick={() => setAuthModal("register")}>
          {t("noAccount")}
        </button>
        <button className="link-btn" onClick={() => setAuthModal("forgot")}>
          {t("forgot")}
        </button>
      </div>
    </>
  );
}

function RegisterForm() {
  const { register, setAuthModal } = useApp();
  const { t } = useTranslation();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  return (
    <>
      <h2>{t("registerTitle")}</h2>
      <p className="sub">{t("registerSub")}</p>
      <div className="field">
        <label>{t("name")}</label>
        <input ref={nameRef} placeholder="Aisha Bello" />
      </div>
      <div className="field">
        <label>{t("email")}</label>
        <input ref={emailRef} type="email" placeholder="you@example.com" />
      </div>
      <div className="field">
        <label>{t("password")}</label>
        <input ref={passwordRef} type="password" placeholder="••••••••" />
      </div>
      <button
        className="btn btn-primary"
        style={{ width: "100%", marginBottom: 10 }}
        onClick={() => register(nameRef.current.value, emailRef.current.value, passwordRef.current.value)}
      >
        {t("register")}
      </button>
      <button className="link-btn" onClick={() => setAuthModal("login")}>
        {t("haveAccount")}
      </button>
    </>
  );
}

function ForgotForm() {
  const { forgotPassword, setAuthModal } = useApp();
  const { t } = useTranslation();
  const emailRef = useRef(null);

  return (
    <>
      <h2>{t("forgotTitle")}</h2>
      <p className="sub">{t("forgotSub")}</p>
      <div className="field">
        <label>{t("email")}</label>
        <input ref={emailRef} type="email" placeholder="you@example.com" />
      </div>
      <button
        className="btn btn-primary"
        style={{ width: "100%", marginBottom: 10 }}
        onClick={() => forgotPassword(emailRef.current.value)}
      >
        {t("send")}
      </button>
      <button className="link-btn" onClick={() => setAuthModal("login")}>
        {t("haveAccount")}
      </button>
    </>
  );
}
