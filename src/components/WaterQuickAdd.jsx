import { Droplets, Plus, Minus } from "lucide-react";

export function WaterQuickAdd({ currentValue, goal, onAdd, className }) {
  const progress = goal > 0 ? (currentValue / goal) * 100 : 0;
  const glasses = Math.floor(currentValue / 250);

  return (
    <div className={`card border-0 shadow-sm glass rounded-4 p-4 ${className || ""}`}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex h-10 w-10 align-items-center justify-content-center rounded-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Droplets className="h-5 w-5" style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <p className="small fw-bold text-muted mb-0">Water Intake</p>
            <p className="h5 fw-bold mb-0">{currentValue} ml</p>
          </div>
        </div>
        <span className="small text-muted">{glasses} glasses</span>
      </div>

      <div className="d-flex align-items-center gap-2 mb-4">
        <button
          className="btn btn-outline-light border text-dark h-10 w-10 p-0 rounded-4 shadow-none"
          onClick={() => onAdd(-250)}
          disabled={currentValue < 250}
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="flex-grow-1 d-flex justify-content-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={`h-8 w-3 rounded-pill transition-colors duration-300 ${i <= glasses ? "" : "bg-light"}`}
              style={{ backgroundColor: i <= glasses ? '#3b82f6' : undefined }}
            />
          ))}
        </div>

        <button
          className="btn btn-outline-light border text-dark h-10 w-10 p-0 rounded-4 shadow-none"
          onClick={() => onAdd(250)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="h-2 bg-light rounded-pill overflow-hidden">
        <div
          className="h-100 rounded-pill transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: '#3b82f6' }}
        />
      </div>
      <p className="small text-muted mt-2 text-center mb-0">
        {goal - currentValue > 0 ? `${goal - currentValue} ml to daily goal` : "Daily goal reached! 💧"}
      </p>
    </div>
  );
}
