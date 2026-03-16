import { Pencil, Trash2, Clock, Flame, Heart, Zap, Infinity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const categoryIcons = {
  cardio: Heart,
  strength: Zap,
  flexibility: Infinity,
  other: Flame,
};

export function WorkoutCard({ workout, onEdit, onDelete }) {
  const Icon = categoryIcons[workout.category] || categoryIcons.other;
  const categoryClass = workout.category || "other";
  const intensityClass = `badge-${workout.intensity || "medium"}`;

  const getTimeAgo = () => {
    try {
      // If we have a timestamp or full date, use it. Otherwise use workout_date at start of day.
      const date = new Date(workout.workout_date);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="card workout-card-premium border-0 shadow-sm rounded-4 group mb-3 shadow-hover bg-white">
      <div className="card-body p-4">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className={`icon-box ${categoryClass}`}>
              <Icon size={24} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h3 className="h6 fw-bold mb-0 text-capitalize">{workout.workout_type}</h3>
                <span className={`badge-intensity ${intensityClass}`}>
                  {workout.intensity || "Medium"}
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Clock className="h-4 w-4" />
                  <span>{workout.duration_minutes} min</span>
                </div>
                {workout.calories_burned && (
                  <div className="d-flex align-items-center gap-2 small text-muted">
                    <Flame className="h-4 w-4" />
                    <span>{workout.calories_burned} cal</span>
                  </div>
                )}
                <span className="small text-muted d-none d-sm-inline">
                  • {getTimeAgo()}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex gap-1 opacity-0-desktop group-hover-opacity-100 transition-opacity">
            <button
              className="btn btn-link btn-sm text-secondary p-2 rounded-3 hover-bg-light"
              onClick={() => onEdit(workout)}
              title="Edit workout"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="btn btn-link btn-sm text-danger p-2 rounded-3 hover-bg-danger-light"
              onClick={() => onDelete(workout.id)}
              title="Delete workout"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {workout.notes && (
          <div className="mt-3 pt-3 border-top">
            <p className="small text-muted mb-0">
              {workout.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
