import { useApp } from "../../context/AppContext.jsx";
import ProfileHeader from "./ProfileHeader.jsx";
import "./Profile.css";
import { useTranslation } from "../../i18n/index.js";

export default function Profile() {
  const { user, logout } = useApp();
  const { t } = useTranslation();

  return (
    <div className="profile-page">
      <h1>{t("myProfile")}</h1>
        <ProfileHeader />
     { /*  <div className="form-card">
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
        <p>Role: {user?.role}</p> */ }

        <button
          className="btn btn-primary"
          style={{ marginTop: "20px", float: "right"}}
          onClick={logout}
        >
          {t("logout") }
        </button>
    </div>
  );
}
