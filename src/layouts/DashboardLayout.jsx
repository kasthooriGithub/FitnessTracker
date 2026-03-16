import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navigation from "../components/Navigation";
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
        <div className="min-vh-100 bg-light">
            <Navigation />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
