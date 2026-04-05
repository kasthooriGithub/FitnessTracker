import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { useWorkouts } from "../hooks/useWorkouts";
import {
  Dumbbell,
  User,
  Target,
  Footprints,
  Flame,
  Droplets,
  Save,
  LogOut,
  Activity,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { ConfirmDialog } from "../components/ConfirmDialog";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { workouts } = useWorkouts();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goal, setGoal] = useState("");
  const [weightGoal, setWeightGoal] = useState("");
  const [stepsGoal, setStepsGoal] = useState("10000");
  const [caloriesGoal, setCaloriesGoal] = useState("500");
  const [waterGoal, setWaterGoal] = useState("2500");
  const [workoutGoal, setWorkoutGoal] = useState("5");
  const [motivation, setMotivation] = useState("");

  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSignout, setShowSignout] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setHeightCm(profile.height_cm ? String(profile.height_cm) : "");
      setWeightKg(profile.weightKg ? String(profile.weightKg) : "");
      setGoal(profile.goal || "");
      setWeightGoal(profile.weight_goal_kg ? String(profile.weight_goal_kg) : "");
      setStepsGoal(profile.daily_steps_goal ? String(profile.daily_steps_goal) : "10000");
      setCaloriesGoal(profile.daily_calories_goal ? String(profile.daily_calories_goal) : "500");
      setWaterGoal(profile.daily_water_goal_ml ? String(profile.daily_water_goal_ml) : "2500");
      setWorkoutGoal(profile.weekly_workout_goal ? String(profile.weekly_workout_goal) : "5");
      setMotivation(profile.motivation || "");
    }
  }, [profile]);

  if (profileLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="d-flex align-items-center gap-3">
          <Dumbbell className="h-8 w-8 text-primary animate-spin" />
          <span className="h4 fw-bold mb-0">Loading...</span>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);

    await updateProfile({
      full_name: fullName,
      height_cm: heightCm ? parseFloat(heightCm) : null,
      weightKg: weightKg ? parseFloat(weightKg) : null,
      goal: goal || null,
      weight_goal_kg: weightGoal ? parseFloat(weightGoal) : null,
      daily_steps_goal: parseInt(stepsGoal, 10) || 10000,
      daily_calories_goal: parseInt(caloriesGoal, 10) || 500,
      daily_water_goal_ml: parseInt(waterGoal, 10) || 2500,
      weekly_workout_goal: parseInt(workoutGoal, 10) || 5,
      motivation: motivation,
    });

    setSaving(false);
    setIsEditing(false);

    toast({
      title: "Profile Updated",
      description: "Your settings have been saved successfully.",
    });
  };

  const handleSignout = async () => {
    setShowSignout(false);
    await signOut();
  };

  const last7Days = [...Array(7)]
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    })
    .reverse();

  const weeklyData = last7Days.map((date) => {
    const count = workouts.filter((w) => w.workout_date === date).length;
    const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
    return { dayName, count };
  });

  const maxWorkouts = Math.max(...weeklyData.map((d) => d.count), 1);

  const getLockedFieldProps = () => {
    if (!isEditing) {
      return {
        title: "Please click Edit button. After that you can edit this field.",
        style: { backgroundColor: "#f9fafb", cursor: "not-allowed" },
      };
    }
    return {
      title: "",
      style: {},
    };
  };

  const lockedFieldProps = getLockedFieldProps();

  return (
    <div className="page-container">
      <div className="mb-3">
        <h1 className="display-5 fw-bold mb-0">Profile</h1>
        <p className="muted fw-medium mb-0">Manage your account and fitness goals</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7 d-flex flex-column gap-4">
          <div className="card-soft h-100">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-square bg-warning-soft">
                  <Activity size={20} />
                </div>
                <div>
                  <h2 className="h5 fw-bold mb-0">Weekly Activity</h2>
                  <p className="muted mb-0">Workout frequency (Last 7 days)</p>
                </div>
              </div>
            </div>

            <div
              className="d-flex align-items-end justify-content-between gap-2 pt-2"
              style={{ height: 150 }}
            >
              {weeklyData.map((d, i) => (
                <div key={i} className="flex-grow-1 d-flex flex-column align-items-center gap-2">
                  <div
                    className="w-100 rounded-3 bg-primary bg-opacity-10 position-relative overflow-hidden"
                    style={{ height: 100 }}
                  >
                    <div
                      className="position-absolute bottom-0 start-0 end-0 bg-primary opacity-75 transition-all"
                      style={{
                        height: `${(d.count / maxWorkouts) * 100}%`,
                        minHeight: d.count > 0 ? "10%" : "0",
                      }}
                    />
                  </div>
                  <span className="small text-muted fw-bold" style={{ fontSize: "0.65rem" }}>
                    {d.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-soft">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="icon-square bg-success-soft">
                <Target size={20} />
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Daily Targets</h2>
                <p className="muted mb-0">Your fitness benchmarks</p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div
                  className="d-flex align-items-center gap-2 mb-2"
                  title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                >
                  <Footprints size={18} className="text-primary" />
                  <label className="form-label small fw-bold mb-0">Steps</label>
                </div>
                <input
                  type="number"
                  className="form-control input-modern"
                  value={stepsGoal}
                  onChange={(e) => setStepsGoal(e.target.value)}
                  placeholder="10000"
                  readOnly={!isEditing}
                  title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                  style={lockedFieldProps.style}
                />
              </div>

              <div className="col-12 col-md-6">
                <div
                  className="d-flex align-items-center gap-2 mb-2"
                  title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                >
                  <Flame size={18} className="text-danger" />
                  <label className="form-label small fw-bold mb-0">Calories</label>
                </div>
                <input
                  type="number"
                  className="form-control input-modern"
                  value={caloriesGoal}
                  onChange={(e) => setCaloriesGoal(e.target.value)}
                  placeholder="500"
                  readOnly={!isEditing}
                  title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                  style={lockedFieldProps.style}
                />
              </div>

              <div className="col-12 col-md-6">
                <div
                  className="d-flex align-items-center gap-2 mb-2"
                  title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                >
                  <Droplets size={18} className="text-info" />
                  <label className="form-label small fw-bold mb-0">Water (ml)</label>
                </div>
                <input
                  type="number"
                  className="form-control input-modern"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)}
                  placeholder="2500"
                  readOnly={!isEditing}
                  title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                  style={lockedFieldProps.style}
                />
              </div>

              <div className="col-12 col-md-6">
                <div
                  className="d-flex align-items-center gap-2 mb-2"
                  title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                >
                  <Dumbbell size={18} className="text-primary" />
                  <label className="form-label small fw-bold mb-0">Weekly Workout Target</label>
                </div>
                <input
                  type="number"
                  className="form-control input-modern"
                  value={workoutGoal}
                  onChange={(e) => setWorkoutGoal(e.target.value)}
                  placeholder="5"
                  readOnly={!isEditing}
                  title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                  style={lockedFieldProps.style}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          <div className="card-soft">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-square bg-primary-soft">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="h5 fw-bold mb-0">Personal Info</h2>
                  <p className="muted mb-0">Basic details</p>
                </div>
              </div>

              <button
                className={`btn btn-sm ${isEditing ? "btn-light" : "btn-outline-primary"}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            {!isEditing && (
              <div className="alert alert-light border small mb-4 py-2 px-3">
                Please click <strong>Edit</strong> button. After that you can edit the profile fields.
              </div>
            )}

            <div className="d-flex flex-column gap-3">
              <div className="form-group">
                <label className="form-label small fw-bold">Full Name</label>
                <input
                  className="form-control input-modern"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Johnson"
                  readOnly={!isEditing}
                  title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                  style={lockedFieldProps.style}
                />
              </div>

              <div className="form-group">
                <label className="form-label small fw-bold">Email (Read-only)</label>
                <input
                  className="form-control input-modern"
                  style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Current Weight (kg)</label>
                  <input
                    type="number"
                    className="form-control input-modern"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="70"
                    readOnly={!isEditing}
                    title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                    style={lockedFieldProps.style}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label small fw-bold">Fitness Goal</label>
                  <div
                    title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                  >
                    <select
                      className="form-select input-modern"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      disabled={!isEditing}
                      title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                      style={lockedFieldProps.style}
                    >
                      <option value="">Select goal...</option>
                      <option value="lose">Lose Weight</option>
                      <option value="gain">Gain Weight</option>
                      <option value="maintain">Maintain Weight</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Height (cm)</label>
                  <input
                    type="number"
                    className="form-control input-modern"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="175"
                    readOnly={!isEditing}
                    title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                    style={lockedFieldProps.style}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label small fw-bold">Target Weight (kg)</label>
                  <input
                    type="number"
                    className="form-control input-modern"
                    value={weightGoal}
                    onChange={(e) => setWeightGoal(e.target.value)}
                    placeholder="70"
                    readOnly={!isEditing}
                    title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
                    style={lockedFieldProps.style}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card-soft">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="icon-square bg-info-soft">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Motivation</h2>
                <p className="muted mb-0">Your fitness drive</p>
              </div>
            </div>

            <textarea
              className="form-control input-modern"
              rows="3"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="e.g. Training for my first 5k!"
              readOnly={!isEditing}
              title={!isEditing ? "Please click Edit button. After that you can edit this field." : ""}
              style={lockedFieldProps.style}
            />
          </div>

          <div className="d-flex flex-column gap-2">
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-pill btn-pill-primary py-3 w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              >
                {saving ? (
                  <Dumbbell className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span>{saving ? "Saving..." : "Save All Changes"}</span>
              </button>
            )}

            <button
              onClick={() => setShowSignout(true)}
              className="btn btn-outline-danger btn-pill py-3 w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showSignout}
        title="Sign Out?"
        message="Are you sure you want to end your current session?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onCancel={() => setShowSignout(false)}
        onConfirm={handleSignout}
      />
    </div>
  );
}