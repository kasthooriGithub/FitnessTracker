import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { WorkoutCard } from "../components/WorkoutCard";
import { AddWorkoutDialog } from "../components/AddWorkoutDialog";
import { EmptyState } from "../components/EmptyState";
import { useWorkouts } from "../hooks/useWorkouts";
import { Plus, Dumbbell, Search, Activity } from "lucide-react";

export default function Workouts() {
  const { workouts, addWorkout, updateWorkout, deleteWorkout, loading } = useWorkouts();

  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "cardio", label: "Cardio" },
    { id: "strength", label: "Strength" },
    { id: "flexibility", label: "Flexibility" },
  ];
  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setWorkoutDialogOpen(true);
  };

  const handleSaveWorkout = (workout) => {
    if (workout.id) updateWorkout(workout);
    else addWorkout(workout);
    setEditingWorkout(null);
  };

  const filteredWorkouts = (workouts || []).filter((workout) => {
    const matchesSearch = (workout.workout_type || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || (workout.category || "other") === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Group workouts by date
  const groupedWorkouts = filteredWorkouts.reduce((acc, workout) => {
    const date = workout.workout_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(workout);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedWorkouts).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="container py-4 py-lg-5" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-start justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h1 fw-bold mb-1">Workouts</h1>
          <p className="text-muted h6 fw-medium">Track and manage your exercises</p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary rounded-3 px-4 fw-bold h-10 shadow-sm d-flex align-items-center gap-2"
            onClick={() => {
              setEditingWorkout(null);
              setWorkoutDialogOpen(true);
            }}
          >
            <Plus size={18} strokeWidth={3} />
            <span>Log Workout</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 mb-4">
        <div className="d-flex gap-2 overflow-auto pb-2 pb-lg-0 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`workout-pill no-wrap ${activeFilter === f.id ? "active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="position-relative flex-grow-1 max-w-md">
          <Search
            className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"
            size={18}
          />
          <input
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control rounded-3 py-2 ps-5 border-0 shadow-sm"
            style={{ height: "42px", background: "#fff" }}
          />
        </div>
      </div>

      {/* Workouts List */}
      {loading ? (
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border rounded-4"
              style={{ height: "8rem" }}
            />
          ))}
        </div>
      ) : sortedDates.length > 0 ? (
        <div className="d-flex flex-column gap-5">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="date-divider">
                <h2 className="small fw-bold text-muted text-uppercase tracking-wider">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>

              <div className="d-flex flex-column gap-3">
                {groupedWorkouts[date].map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onEdit={handleEditWorkout}
                    onDelete={deleteWorkout}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <EmptyState
              icon={Dumbbell}
              title={searchQuery ? "No workouts found" : "No workouts yet"}
              description={
                searchQuery
                  ? "Try a different search term to find your workouts"
                  : "Start tracking your fitness journey by adding your first workout"
              }
              actionLabel={!searchQuery ? "Add Your First Workout" : undefined}
              onAction={
                !searchQuery
                  ? () => {
                    setEditingWorkout(null);
                    setWorkoutDialogOpen(true);
                  }
                  : undefined
              }
            />
          </div>
        </div>
      )}

      <AddWorkoutDialog
        open={workoutDialogOpen}
        onOpenChange={setWorkoutDialogOpen}
        onSave={handleSaveWorkout}
        editingWorkout={editingWorkout}
      />
    </div>
  );
}
