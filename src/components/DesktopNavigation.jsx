import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Utensils, Dumbbell, TrendingUp, User, LogOut, Activity } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { ConfirmDialog } from "./ConfirmDialog";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/nutrition", icon: Utensils, label: "Nutrition" },
  { path: "/workouts", icon: Dumbbell, label: "Workouts" },
  { path: "/history", icon: TrendingUp, label: "Progress" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function DesktopNavigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [showSignout, setShowSignout] = useState(false);

  const handleSignout = async () => {
    setShowSignout(false);
    await signOut();
  };

  return (
    <>
      <aside
        className="d-none d-lg-flex flex-column position-fixed top-0 bottom-0 start-0 border-end bg-white shadow-sm"
        style={{ width: "var(--sidebar-width, 264px)", zIndex: 1000 }}
      >
        <div className="d-flex flex-column flex-grow-1 px-4 py-4">
          <div className="d-flex align-items-center gap-3 px-2 mb-4">
            <div className="d-flex h-10 w-10 align-items-center justify-content-center rounded-3 bg-primary">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="h5 fw-bold mb-0">FitTrack Pro</span>
          </div>

          <nav className="d-flex flex-column gap-1 mt-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${isActive ? "bg-primary text-white shadow-sm" : "text-secondary nav-link-custom"
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="fw-semibold small">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4">
            <div className="sidebar-user-card d-flex align-items-center gap-3">
              <div className="avatar-circle flex-shrink-0">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "U")}
              </div>
              <div className="overflow-hidden">
                <div className="fw-bold small text-dark text-truncate">
                  {profile?.full_name || "User"}
                </div>
                <div className="small text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                  {user?.email || "user@example.com"}
                </div>
              </div>
            </div>

            <button
              className="sidebar-signout-btn"
              onClick={() => setShowSignout(true)}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={showSignout}
        title="Sign out?"
        message="Are you sure you want to sign out from FitTrack?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onCancel={() => setShowSignout(false)}
        onConfirm={handleSignout}
      />
    </>
  );
}
