import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { WorkoutCard } from "../components/WorkoutCard";
import { AddWorkoutDialog } from "../components/AddWorkoutDialog";
import { EmptyState } from "../components/EmptyState";
import { ProgressRing } from "../components/ProgressRing";
import { CalorieSummaryCard } from "../components/CalorieSummaryCard";
import { BMICard } from "../components/BMICard";
import { BMISetupModal } from "../components/BMISetupModal";
import { useDailyLogs } from "../hooks/useDailyLogs";
import { useWorkouts } from "../hooks/useWorkouts";
import { useProfile } from "../hooks/useProfile";
import { useNutrition } from "../hooks/useNutrition";
import { DailyFitnessSummary } from "../components/DailyFitnessSummary";
import { Footprints, Flame, Plus, Dumbbell, Activity } from "lucide-react";
import { Modal, Button } from "react-bootstrap";

import "./Dashboard.css";

export default function Dashboard() {
  const { todayLog, logs, updateLog } = useDailyLogs();
  const { workouts, loading: workoutsLoading, addWorkout, updateWorkout, deleteWorkout, todaysWorkouts, todaysTotalCalories } = useWorkouts();
  const { profile, updateProfile } = useProfile();
  const { totals: nutritionTotals } = useNutrition(); // Defaults to today's date

  // Calculate calories from steps (approx 0.04 kcal per step)
  const stepCalories = Math.round((todayLog?.steps || 0) * 0.04);
  const totalCaloriesBurned = (todaysTotalCalories || 0) + stepCalories;

  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showBMISetup, setShowBMISetup] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [stepsInput, setStepsInput] = useState("");

  // Water Goal Celebration
  const dailyWaterGoal = profile?.daily_water_goal_ml || 2000;
  const currentWater = todayLog?.water_ml || 0;
  const isWaterGoalMet = currentWater >= dailyWaterGoal && dailyWaterGoal > 0;

  useEffect(() => {
    if (!profile || !todayLog) return;
    
    // Get today's local date string
    const todayStr = new Date().toLocaleDateString();
    const lastCelebrated = localStorage.getItem("water_celebrated_date_v2");

    // If water goes below the goal, we reset the celebration memory so they can trigger it again today!
    if (!isWaterGoalMet && lastCelebrated === todayStr) {
      localStorage.removeItem("water_celebrated_date_v2");
    }

    if (isWaterGoalMet && lastCelebrated !== todayStr) {
      setShowWaterModal(true); // Open big modal
      localStorage.setItem("water_celebrated_date_v2", todayStr);
    }
  }, [currentWater, dailyWaterGoal, profile, todayLog, isWaterGoalMet]);

  // Check if profile needs setup (missing height, weight, age, or calculations)
  useEffect(() => {
    if (todayLog?.steps !== undefined) {
      setStepsInput(todayLog.steps.toString());
    }
  }, [todayLog?.steps]);

  useEffect(() => {
    if (!profile) return;

    const isProfileIncomplete = !profile.height_cm || !profile.weightKg || !profile.age || !profile.calories_calculated;

    if (isProfileIncomplete) {
      setShowBMISetup(true);
    }
  }, [profile]);

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setWorkoutDialogOpen(true);
  };

  const handleSaveWorkout = (workout) => {
    if (workout.id) updateWorkout(workout);
    else addWorkout(workout);
    setEditingWorkout(null);
  };

  const handleSaveProfileData = async (data) => {
    // Data already contains calculated BMI, BMR, etc. from the modal
    await updateProfile(data);
    setShowBMISetup(false);
  };

  const handleRecalculate = () => {
    setShowBMISetup(true);
  };

  const handleWaterQuickAdd = (amount) => {
    const currentWater = todayLog?.water_ml || 0;
    const newValue = Math.max(0, currentWater + amount);
    updateLog("water_ml", newValue);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-5">
        <h1 className="display-5 fw-bold mb-1">
          {greeting()}, {profile?.full_name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="muted fw-medium">Here's your fitness snapshot for today</p>
      </div>

      {/* Daily Fitness Summary - Merged View */}
      <DailyFitnessSummary
        caloriesIn={nutritionTotals.calories}
        caloriesOut={totalCaloriesBurned}
        targetCalories={profile?.daily_calories_goal || 2000}
      />

      {/* Calorie Summary Card (Legacy/Plan View) */}
      <CalorieSummaryCard profile={profile} onRecalculate={handleRecalculate} />

      {/* BMI Card */}
      <BMICard profile={profile} />

      {/* Daily Snapshot Card */}
      <div className="card-soft ring-card mb-4">
        <h2 className="h6 fw-bold text-muted text-uppercase tracking-wider mb-5 text-start">Daily Snapshot</h2>

        <div className="ring-grid">
          <div className="ring-item">
            <ProgressRing
              progress={(todayLog?.steps || 0) / (profile?.daily_steps_goal || 10000) * 100}
              size={120}
              strokeWidth={10}
              color="#3b82f6"
            >
              <div className="text-center">
                <div className="ring-value">{(todayLog?.steps || 0).toLocaleString()}</div>
                <div className="ring-goal">/ {(profile?.daily_steps_goal || 10000).toLocaleString()}</div>
              </div>
            </ProgressRing>
            <div className="ring-label">Steps</div>
          </div>

          <div className="ring-item">
            <ProgressRing
              progress={(todayLog?.water_ml || 0) / (profile?.daily_water_goal_ml || 2000) * 100}
              size={120}
              strokeWidth={10}
              color="#10b981"
            >
              <div className="text-center">
                <div className="ring-value">{((todayLog?.water_ml || 0) / 1000).toFixed(1)}L</div>
                <div className="ring-goal">/ {((profile?.daily_water_goal_ml || 2000) / 1000).toFixed(1)}L</div>
              </div>
            </ProgressRing>
            <div className="ring-label">Water</div>
          </div>

          <div className="ring-item">
            <ProgressRing
              progress={(totalCaloriesBurned) / (profile?.daily_calories_goal || 500) * 100}
              size={120}
              strokeWidth={10}
              color="#f59e0b"
            >
              <div className="text-center">
                <div className="ring-value">{totalCaloriesBurned}</div>
                <div className="ring-goal">/ {(profile?.daily_calories_goal || 500)}</div>
              </div>
            </ProgressRing>
            <div className="ring-label">Calories (Active)</div>
          </div>
        </div>
      </div>

      {/* Manual Tracking Row */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6">
          <div className={`card-soft h-100 ${isWaterGoalMet ? 'water-goal-achieved' : ''}`}>
            <div className="d-flex align-items-start mb-4">
              <div className="icon-square bg-water-soft">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="h6 fw-bold mb-0">Water Intake</h3>
                <p className="muted mb-0">Track your hydration</p>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <div className="h2 fw-bold mb-0">{todayLog?.water_ml || 0}ml</div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-light rounded-3"
                  onClick={() => handleWaterQuickAdd(-250)}
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  <Plus style={{ transform: 'rotate(45deg)' }} size={18} />
                </button>
                <button
                  className="btn btn-pill btn-pill-success shadow-sm"
                  onClick={() => handleWaterQuickAdd(250)}
                >
                  + 250ml
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card-soft h-100">
            <div className="d-flex align-items-start mb-4">
              <div className="icon-square bg-steps-soft">
                <Footprints size={20} />
              </div>
              <div>
                <h3 className="h6 fw-bold mb-0">Steps</h3>
                <p className="muted mb-0">Manual entry</p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <input
                type="number"
                className="form-control input-modern"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                onBlur={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (val !== (todayLog?.steps || 0)) {
                    updateLog("steps", val);
                  }
                }}
                placeholder="7234"
              />
              <button
                className="btn btn-pill btn-pill-primary shadow-sm no-wrap"
                onClick={() => updateLog("steps", (todayLog?.steps || 0) + 1000)}
              >
                +1K
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="h5 fw-bold mb-0">Recent Activity</h2>
          <a href="/workouts" className="text-primary text-decoration-none small fw-bold">View all</a>
        </div>

        <div className="d-flex flex-column gap-3">
          {todaysWorkouts.length > 0 ? (
            todaysWorkouts.slice(0, 3).map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onEdit={handleEditWorkout}
                onDelete={deleteWorkout}
              />
            ))
          ) : (
            <div className="card-soft p-5 text-center bg-light border-0">
              <Dumbbell className="text-muted mb-3 mx-auto" size={48} style={{ opacity: 0.3 }} />
              <p className="muted mb-0">No activities recorded for today.</p>
              <button
                className="btn btn-link text-primary fw-bold text-decoration-none p-0 mt-2"
                onClick={() => setWorkoutDialogOpen(true)}
              >
                Log your first workout
              </button>
            </div>
          )}
        </div>
      </div>

      <AddWorkoutDialog
        open={workoutDialogOpen}
        onOpenChange={setWorkoutDialogOpen}
        onSave={handleSaveWorkout}
        editingWorkout={editingWorkout}
      />

      <BMISetupModal
        show={showBMISetup}
        onHide={() => setShowBMISetup(false)}
        onSave={handleSaveProfileData}
        profile={profile}
      />

      <Modal show={showWaterModal} onHide={() => setShowWaterModal(false)} centered className="border-0 shadow-lg">
        <Modal.Body className="text-center p-5 rounded-4 shadow-lg" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)" }}>
          <div className="mb-4">
            <span style={{ fontSize: "6rem" }}>🎉</span>
          </div>
          <h2 className="display-6 fw-bold mb-3" style={{ color: "#0369a1" }}>Congratulations!</h2>
          <p className="lead mb-4" style={{ color: "#0c4a6e" }}>
            You reached your daily <strong>{(dailyWaterGoal / 1000).toFixed(1)}L</strong> water goal 💧
            <br />
            Excellent work staying hydrated today!
          </p>
          <Button variant="primary" size="lg" className="rounded-pill px-5 py-3 fw-bold shadow mt-2" onClick={() => setShowWaterModal(false)}>
            Awesome!
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
