import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import DesktopNavigation from "../components/DesktopNavigation";
import MobileBottomNav from "../components/MobileBottomNav";
import { useAuth } from "../contexts/AuthContext";
import { Activity } from "lucide-react";

const DashboardLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <Activity className="h-8 w-8 text-primary animate-spin mb-3" />
                    <p className="h5 fw-bold text-secondary">Loading FitTrack...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div className="min-vh-100 bg-light d-flex flex-column flex-lg-row">
            <DesktopNavigation />
            <div className="flex-grow-1 d-flex flex-column">
                <main className="main-content flex-grow-1">
                    <Outlet />
                </main>
                <MobileBottomNav />
            </div>
        </div>
    );
};

export default DashboardLayout;
