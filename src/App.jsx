import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AlertProvider } from "./contexts/AlertContext";
import { AuthProvider } from "./contexts/AuthContext";

import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Workouts from "./pages/Workouts";
import History from "./pages/History";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Nutrition from "./pages/Nutrition";

import DashboardLayout from "./layouts/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AlertProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth page usually without sidebar */}
            <Route path="/auth" element={<Auth />} />

            {/* Authenticated Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
