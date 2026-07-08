import { useApp } from "../../context/AppContext.jsx";


export default function ProfileHeader() {
  const { user } = useApp();

  // Generate initials if there's no profile picture
  const initials =
    user?.name
      ?.charAt(0)
      .toUpperCase() || "U";

  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} />
        ) : (
          initials
        )}
      </div>

      <h2>{user?.name}</h2>

      <p className="profile-email">{user?.email}</p>

      <span className="profile-role">
        {user?.role === "admin" ? "Administrator" : "Member"}
      </span>
      
      
    </div>
  );
}
