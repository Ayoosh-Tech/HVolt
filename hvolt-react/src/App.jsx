import { useEffect } from "react";
import { useApp } from "./context/AppContext.jsx";
import Sidebar from "./components/Layout/Sidebar.jsx";
import TopBar from "./components/Layout/TopBar.jsx";
import BottomNav from "./components/Layout/BottomNav.jsx";
import AuthModal from "./components/Auth/AuthModal.jsx";
import ToastContainer from "./components/Toast/ToastContainer.jsx";
import MapPage from "./components/Map/MapPage.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import ReportForm from "./components/Report/ReportForm.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import Profile from "./components/Profile/Profile.jsx";

export default function App() {
  const { view, user, theme } = useApp();
  //console.log("Current view:", view);
  const isAdmin = user?.role === "admin";

  // Theme CSS variables are scoped under `html.dark` (see styles/main.css),
  // so the theme class toggles on the document root, same as the original app.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <>
      <ToastContainer />
      <div id="app">
        <Sidebar />
        <main>
          <TopBar />
          <div className="view">
            {view === "map" && <MapPage />}
            {view === "dashboard" && <Dashboard />}
            {view === "report" && <ReportForm />}
            {view === "profile" && user && <Profile />}
            {view === "admin" && isAdmin && <AdminDashboard />}
          </div>
        </main>
        <BottomNav />
        <AuthModal />
      </div>
    </>
  );
}
