import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";

export default function ChangePasswordModal() {
  const { token, toast } = useApp();
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast(t("passwordsDoNotMatch"));
      return;
    }
   
    
    try {

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast(data.message);
        return;
      }

      toast(t("passwordChangedSuccessfully"));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast("Something went wrong.");
    }
  }

  return (
    <div className="profile-card">
      <h3>🔒 {t("changePassword")}</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder={t("currentPassword")}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder={t("newPassword")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder={t("confirmPassword")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="btn btn-primary" type="submit">
          {t("changePasswordButton")}
        </button>
      </form>
    </div>
  );
}
