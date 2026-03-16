import { ProgressRing } from "../components/ProgressRing";

export function StatCard({
  title,
  value,
  goal,
  unit,
  icon: Icon,
  color,
  bgColor,
  className,
  onClick,
}) {
  const progress = goal > 0 ? (value / goal) * 100 : 0;

  return (
    <div
      className={`card cursor-pointer group overflow-hidden glass border-0 shadow-sm ${className || ""}`}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div
            className={`d-flex h-12 w-12 align-items-center justify-content-center rounded-4 transition-all duration-300 group-hover-scale-110 ${bgColor}`}
          >
            {Icon && <Icon className={`h-6 w-6 ${color}`} />}
          </div>
          <ProgressRing
            progress={progress}
            size={48}
            strokeWidth={5}
            color={color.includes("text-") ? `hsl(var(--${color.replace("text-", "")}))` : color}
          >
            <span style={{ fontSize: '10px' }} className="fw-bold">{Math.round(progress)}%</span>
          </ProgressRing>
        </div>

        <div className="gap-1 d-flex flex-column">
          <p className="small fw-medium text-muted m-0">{title}</p>
          <p className="h3 fw-bold tracking-tight m-0">
            {value.toLocaleString()}
            <span className="small fw-normal text-muted ms-1">{unit}</span>
          </p>
        </div>

        <div className="mt-4 h-2 bg-light rounded-pill overflow-hidden">
          <div
            className={`h-100 rounded-pill transition-all duration-700 ease-out ${color.replace("text-", "bg-")}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="small text-muted mt-2 m-0">
          {goal - value > 0 ? `${(goal - value).toLocaleString()} ${unit} to goal` : "Goal reached! 🎉"}
        </p>
      </div>
    </div>
  );
}
