
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Settings as SettingsIcon, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "./Settings.css";

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: "light",
    language: "eng",
    notifications: { email: true, push: true, marketing: false },
  });
  const [saving, setSaving] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/settings");
        if (data.success) setSettings((s) => ({ ...s, ...data.settings }));
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    })();
  }, []);

  const initials = (name = "U") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleSettingChange = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    try {
      setSaving(true);
      const { data } = await api.put("/auth/settings", updated);
      if (data.success) toast.success("Settings updated");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-icon">
              <div className="logo-shape" />
            </div>
            <span className="logo-text">CANOVA</span>
          </div>

          {/* User Section */}
          <div className="sidebar-user-section">
            <div className="user-info">
              <div className="user-avatar">
                <span className="avatar-initials">{initials(user?.name)}</span>
              </div>
              <div className="user-details">
                <div className="user-name">{user?.name || "Your name"}</div>
                <div className="user-email">{user?.email || "your@mail.com"}</div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="sidebar-menu">
            <div
              className="menu-item"
              onClick={() => navigate("/profile")}
            >
              <User className="menu-icon" />
              <span>My Profile</span>
              <ChevronRight size={16} />
            </div>

            <div className="menu-item active">
              <SettingsIcon className="menu-icon" />
              <span>Settings</span>
              <ChevronRight size={16} />
            </div>

            <div
              className="menu-item logout"
              onClick={handleLogout}
            >
              <LogOut className="menu-icon" />
              <span>Log Out</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="profile-main">
        <div className="main-content">
          <h1 className="page-title">Settings</h1>

          <div className="profile-form-card">
            <div className="form-content">
              <div className="form-fields">
                {/* Theme */}
                <div className="form-field">
                  <label className="field-label">Theme</label>
                  <select
                    className="field-select"
                    value={settings.theme}
                    onChange={(e) => handleSettingChange("theme", e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                {/* Language */}
                <div className="form-field">
                  <label className="field-label">Language</label>
                  <select
                    className="field-select"
                    value={settings.language}
                    onChange={(e) => handleSettingChange("language", e.target.value)}
                  >
                    <option value="eng">Eng</option>
                    <option value="esp">Esp</option>
                    <option value="fra">Fra</option>
                    <option value="deu">Deu</option>
                  </select>
                </div>
              </div>

              {saving && <div style={{ color: "#2489ff", marginTop: "12px" }}>Saving…</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
