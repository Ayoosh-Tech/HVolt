import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authApi, neighborhoodsApi, reportsApi, adminApi } from "../api/endpoints.js";
import { normalizeNeighborhood, normalizeReport, normalizeUser } from "../api/normalize.js";

const AppContext = createContext(null);

const TOKEN_STORAGE_KEY = "hvolt.token";

// How many reports to pull per fetch. The dashboard/admin views want a broad,
// recent window rather than the API's default page size.
const REPORTS_FETCH_LIMIT = 200;

export function AppProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState(() =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  const [view, setViewRaw] = useState("map");
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [reports, setReports] = useState([]);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | 'forgot' | null
  const [reportType, setReportType] = useState("outage");
  const [filterState, setFilterState] = useState("all");
  const [adminTab, setAdminTabRaw] = useState("reports");
  const [toasts, setToasts] = useState([]);

  const toastSeq = useRef(0);
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const reportsRef = useRef(reports);
  reportsRef.current = reports;

  const toast = useCallback((message) => {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  /* ---------------- Data loading (all from the HVolt API) ---------------- */

  const loadNeighborhoods = useCallback(async () => {
    try {
      const data = await neighborhoodsApi.list();
      setNeighborhoods(data.neighborhoods.map(normalizeNeighborhood));
    } catch (err) {
      toast(err.message);
    }
  }, [toast]);

  const loadReports = useCallback(async () => {
    try {
      const data = await reportsApi.list({ limit: REPORTS_FETCH_LIMIT });
      setReports(data.reports.map(normalizeReport));
    } catch (err) {
      toast(err.message);
    }
  }, [toast]);

  const loadUsers = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      const data = await adminApi.listUsers(tokenRef.current);
      setUsers(data.users.map(normalizeUser));
    } catch (err) {
      toast(err.message);
    }
  }, [toast]);

  // Initial load: neighborhoods + reports are public; restore the session
  // (and, if admin, the user list) if a token was already in storage.
  useEffect(() => {
    loadNeighborhoods();
    loadReports();

    if (token) {
      authApi
        .me(token)
        .then(({ user: rawUser }) => {
          const normalized = normalizeUser(rawUser);
          setUser(normalized);
          if (normalized.role === "admin") loadUsers();
        })
        .catch(() => {
          // Stored token is invalid/expired — clear it rather than looping.
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
        });
    }
    // Only ever runs on mount — subsequent auth changes are handled by
    // login()/register()/logout() directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switching into the admin "Users" tab lazily loads the user list the
  // first time it's needed, without AdminDashboard.jsx knowing anything
  // about the API.
  const setAdminTab = useCallback(
    (tab) => {
      setAdminTabRaw(tab);
      if (tab === "users" && user?.role === "admin") loadUsers();
    },
    [user, loadUsers]
  );

  const setView = useCallback(
    (nextView) => {
      if (nextView === "report" && !user) {
        setAuthModal("login");
        return;
      }
      setViewRaw(nextView);
    },
    [user]
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  /* ---------------- Auth actions ---------------- */

  const login = useCallback(
    async (email, password) => {
      try {
        const { token: newToken, user: rawUser } = await authApi.login(email, password);
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        setToken(newToken);
        const normalized = normalizeUser(rawUser);
        setUser(normalized);
        setAuthModal(null);
        toast("__toastLoggedIn__");
        if (normalized.role === "admin") loadUsers();
        return true;
      } catch (err) {
        toast(err.message);
        return false;
      }
    },
    [toast, loadUsers]
  );

  const register = useCallback(
    async (name, email, password) => {
      try {
        const { token: newToken, user: rawUser } = await authApi.register(name, email, password);
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        setToken(newToken);
        setUser(normalizeUser(rawUser));
        setAuthModal(null);
        toast("__toastRegistered__");
        return true;
      } catch (err) {
        toast(err.message);
        return false;
      }
    },
    [toast]
  );

  const forgotPassword = useCallback(
    async (email) => {
      try {
        await authApi.forgotPassword(email);
        setAuthModal(null);
        toast("__toastResetSent__");
        return true;
      } catch (err) {
        toast(err.message);
        return false;
      }
    },
    [toast]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setUsers([]);
    setViewRaw("map");
    toast("__toastLoggedOut__");
  }, [toast]);

  /* ---------------- Report actions ---------------- */

  const submitReport = useCallback(
    async (neighborhoodId, comment) => {
      if (!user || !tokenRef.current) {
        toast("__loginRequired__");
        setAuthModal("login");
        return false;
      }
      const neighborhood = neighborhoods.find((n) => n.id === neighborhoodId);
      if (!neighborhood) return false;

      try {
        await reportsApi.create(
          { type: reportType, neighborhood: neighborhoodId, lat: neighborhood.lat, lng: neighborhood.lng, comment },
          tokenRef.current
        );
        toast("__toastReportSubmitted__");
        setViewRaw("map");
        await Promise.all([loadReports(), loadNeighborhoods()]);
        return true;
      } catch (err) {
        if (err.status === 429) toast("__duplicateWarning__");
        else toast(err.message);
        return false;
      }
    },
    [user, neighborhoods, reportType, toast, loadReports, loadNeighborhoods]
  );

  // The map popup only knows a neighborhood id (see components/Map/MapView.jsx),
  // so we resolve that to its most recent report before calling the API —
  // this keeps the component's call signature unchanged.
  const latestReportFor = useCallback((neighborhoodId) => {
    return reportsRef.current
      .filter((r) => r.neighborhoodId === neighborhoodId)
      .sort((a, b) => b.ts - a.ts)[0];
  }, []);

  const confirmReport = useCallback(
    async (neighborhoodId) => {
      if (!user || !tokenRef.current) {
        toast("__loginRequired__");
        setAuthModal("login");
        return;
      }
      const latest = latestReportFor(neighborhoodId);
      if (!latest) return;
      try {
        await reportsApi.confirm(latest.id, tokenRef.current);
        toast("__toastConfirmed__");
        await Promise.all([loadReports(), loadNeighborhoods()]);
      } catch (err) {
        toast(err.message);
      }
    },
    [user, latestReportFor, toast, loadReports, loadNeighborhoods]
  );

  const flagReport = useCallback(
    async (neighborhoodId) => {
      if (!user || !tokenRef.current) {
        toast("__loginRequired__");
        setAuthModal("login");
        return;
      }
      const latest = latestReportFor(neighborhoodId);
      if (!latest) return;
      try {
        await reportsApi.flag(latest.id, "", tokenRef.current);
        toast("__toastFlagged__");
        await Promise.all([loadReports(), loadNeighborhoods()]);
      } catch (err) {
        toast(err.message);
      }
    },
    [user, latestReportFor, toast, loadReports, loadNeighborhoods]
  );

  /* ---------------- Admin actions ---------------- */

  const adminSetStatus = useCallback(
    async (reportId, status) => {
      if (!tokenRef.current) return;
      try {
        await adminApi.updateReportStatus(reportId, status, tokenRef.current);
        toast(status === "verified" ? "__toastVerified__" : "__toastRejected__");
        await Promise.all([loadReports(), loadNeighborhoods()]);
      } catch (err) {
        toast(err.message);
      }
    },
    [toast, loadReports, loadNeighborhoods]
  );

  const adminRemoveReport = useCallback(
    async (reportId) => {
      if (!tokenRef.current) return;
      try {
        await adminApi.removeReport(reportId, tokenRef.current);
        toast("__toastRemoved__");
        await Promise.all([loadReports(), loadNeighborhoods()]);
      } catch (err) {
        toast(err.message);
      }
    },
    [toast, loadReports, loadNeighborhoods]
  );

  const toggleAdminRole = useCallback(
    async (userId) => {
      if (!tokenRef.current) return;
      const target = users.find((u) => u.id === userId);
      if (!target) return;
      const nextRole = target.role === "admin" ? "member" : "admin";
      try {
        await adminApi.updateUser(userId, { role: nextRole }, tokenRef.current);
        await loadUsers();
      } catch (err) {
        toast(err.message);
      }
    },
    [users, toast, loadUsers]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      theme,
      toggleTheme,
      view,
      setView,
      user,
      token,
      users,
      reports,
      neighborhoods,
      authModal,
      setAuthModal,
      reportType,
      setReportType,
      filterState,
      setFilterState,
      adminTab,
      setAdminTab,
      toasts,
      toast,
      login,
      register,
      forgotPassword,
      logout,
      submitReport,
      confirmReport,
      flagReport,
      adminSetStatus,
      adminRemoveReport,
      toggleAdminRole,
    }),
    [
      lang,
      theme,
      toggleTheme,
      view,
      setView,
      user,
      token,
      users,
      reports,
      neighborhoods,
      authModal,
      reportType,
      filterState,
      adminTab,
      setAdminTab,
      toasts,
      toast,
      login,
      register,
      forgotPassword,
      logout,
      submitReport,
      confirmReport,
      flagReport,
      adminSetStatus,
      adminRemoveReport,
      toggleAdminRole,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() must be used within an <AppProvider>");
  return ctx;
}
