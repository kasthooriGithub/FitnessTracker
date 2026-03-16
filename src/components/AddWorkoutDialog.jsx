import { useState, useEffect } from "react";
import { useProfile } from "../hooks/useProfile";
import { getIntensityFromDuration, calculateCalories } from "../utils/workoutCalculations";

const workoutTypes = [
  "Running", "Cycling", "Swimming", "Yoga", "Strength Training",
  "Cardio", "HIIT", "Walking", "Pilates", "CrossFit", "Other",
];

const categories = [
  { id: "cardio", label: "Cardio", color: "text-danger" },
  { id: "strength", label: "Strength", color: "text-primary" },
  { id: "flexibility", label: "Flexibility", color: "text-success" },
  { id: "other", label: "Other", color: "text-secondary" },
];

const intensityLevels = [
  { value: "low", label: "Low", color: "bg-success" },
  { value: "medium", label: "Medium", color: "bg-warning" },
  { value: "high", label: "High", color: "bg-danger" },
];

export function AddWorkoutDialog({
  open,
  onOpenChange,
  onSave,
  editingWorkout,
}) {
  const { profile } = useProfile();
  const userWeight = profile?.current_weight_kg || 60; // Default 60kg if not set
  const hasWeight = !!profile?.current_weight_kg;

  const [workoutType, setWorkoutType] = useState("");
  const [category, setCategory] = useState("cardio");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [intensity, setIntensity] = useState("medium");
  const [manualIntensityOverride, setManualIntensityOverride] = useState(false);

  // Reset form when dialog opens/closes or editing workout changes
  useEffect(() => {
    if (editingWorkout) {
      setWorkoutType(editingWorkout.workout_type);
      setCategory(editingWorkout.category || "cardio");
      setDuration(editingWorkout.duration_minutes.toString());
      setCalories(editingWorkout.calories_burned?.toString() || "");
      setNotes(editingWorkout.notes || "");
      setDate(editingWorkout.workout_date);
      setIntensity(editingWorkout.intensity || "medium");
      setManualIntensityOverride(false);
    } else {
      setWorkoutType("");
      setCategory("cardio");
      setDuration("");
      setCalories("");
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
      setIntensity("medium");
      setManualIntensityOverride(false);
    }
  }, [editingWorkout, open]);

  // Auto-select intensity based on duration
  useEffect(() => {
    if (duration && parseInt(duration) > 0 && !manualIntensityOverride) {
      const autoIntensity = getIntensityFromDuration(parseInt(duration));
      setIntensity(autoIntensity);
    }
  }, [duration, manualIntensityOverride]);

  // Auto-calculate calories based on exercise, duration, and intensity
  useEffect(() => {
    if (workoutType && duration && parseInt(duration) > 0) {
      const calculatedCalories = calculateCalories(
        workoutType,
        intensity,
        parseInt(duration),
        userWeight
      );
      setCalories(calculatedCalories.toString());
    } else {
      setCalories("");
    }
  }, [workoutType, duration, intensity, userWeight]);

  const handleIntensityClick = (level) => {
    setIntensity(level);
    setManualIntensityOverride(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const workout = {
      ...(editingWorkout && { id: editingWorkout.id }),
      workout_type: workoutType.toLowerCase(),
      category: category,
      intensity: intensity,
      duration_minutes: parseInt(duration),
      calories_burned: calories ? parseInt(calories) : null,
      notes: notes,
      workout_date: date,
    };

    onSave(workout);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {editingWorkout ? "Edit Workout" : "Add New Workout"}
            </h5>
            <button type="button" className="btn-close" onClick={() => onOpenChange(false)}></button>
          </div>
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Exercise Name</label>
                  <select
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value)}
                    className="form-select rounded-3 py-2"
                    required
                  >
                    <option value="" disabled>Select exercise type</option>
                    {workoutTypes.map((type) => (
                      <option key={type} value={type.toLowerCase()}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select rounded-3 py-2"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="form-control rounded-3 py-2"
                    placeholder="30"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Calories Burned</label>
                  <input
                    type="number"
                    min="0"
                    value={calories}
                    readOnly
                    className="form-control rounded-3 py-2 bg-light"
                    placeholder="Auto-calculated"
                    title="Automatically calculated based on exercise, duration, and intensity"
                  />
                  <small className="text-muted">Auto-calculated</small>
                </div>
              </div>

              {!hasWeight && (
                <div className="alert alert-info py-2 px-3 small mb-3 d-flex align-items-center gap-2" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle-fill flex-shrink-0" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                  </svg>
                  <div>
                    <strong>Tip:</strong> Update your weight in Profile for accurate calorie calculations. Currently using default weight (60kg).
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label small fw-bold">Intensity</label>
                <small className="text-muted d-block mb-2" style={{ fontSize: '0.75rem' }}>
                  {manualIntensityOverride ? 'Manual override active' : 'Auto-selected based on duration (click to override)'}
                </small>
                <div className="d-flex gap-2">
                  {intensityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleIntensityClick(level.value)}
                      className={`flex-grow-1 py-2 rounded-3 small fw-bold border-0 transition-all ${intensity === level.value ? `${level.color} text-white shadow-sm` : "bg-light text-muted"}`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label small fw-bold">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control rounded-3 py-2"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label small fw-bold">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did you feel? Any notes about the workout..."
                  rows={3}
                  className="form-control rounded-3 py-2"
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="d-flex gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1 py-2 rounded-3 fw-bold"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-grow-1 py-2 rounded-3 fw-bold">
                  {editingWorkout ? "Save Changes" : "Add Workout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div >
    </div >
  );
}
