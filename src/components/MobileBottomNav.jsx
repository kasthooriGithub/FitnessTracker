import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Utensils, Dumbbell, TrendingUp, User } from "lucide-react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/nutrition", icon: Utensils, label: "Nutrition" },
  { path: "/workouts", icon: Dumbbell, label: "Workouts" },
  { path: "/history", icon: TrendingUp, label: "Progress" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="position-fixed bottom-0 start-0 end-0 d-lg-none border-top bg-white bg-opacity-75 shadow-lg safe-area-pb"
      style={{ zIndex: 1050, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
    >
      <div className="d-flex align-items-center justify-content-between py-3 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`d-flex flex-column align-items-center gap-1 flex-grow-1 py-1 rounded-3 text-decoration-none ${isActive ? "text-primary" : "text-muted"
                }`}
            >
              <div className={`p-2 rounded-3 ${isActive ? "bg-primary bg-opacity-10" : ""}`}>
                <item.icon className={`h-5 w-5 ${isActive ? "icon-scale" : ""}`} />
              </div>
              <span className="fw-bold" style={{ fontSize: "0.65rem" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
