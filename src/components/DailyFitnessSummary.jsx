import { Activity, Flame, Utensils, Target } from "lucide-react";

export function DailyFitnessSummary({
    caloriesIn = 0,
    caloriesOut = 0,
    targetCalories = 2000
}) {
    const netCalories = caloriesIn - caloriesOut;
    // Remaining = Target - Net (You want to reach your Net target, so calories burned allow you to eat more to reach the same Net)
    // Formula: Remaining = Target - (In - Out)
    const remainingCalories = targetCalories - netCalories;

    const progress = Math.min((netCalories / targetCalories) * 100, 100);
    const isOver = remainingCalories < 0;

    const getRecommendation = () => {
        if (isOver) {
            return `You've exceeded your net target by ${Math.abs(remainingCalories)} kcal. Consider a light workout to balance it out.`;
        }
        return `You can consume ~${remainingCalories} more kcal today to reach your goal.`;
    };

    const getProgressColor = () => {
        if (isOver) return "bg-danger";
        if (progress > 90) return "bg-warning";
        return "bg-primary";
    };

    return (
        <div className="card-soft mb-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="icon-square bg-primary-soft">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="h6 fw-bold mb-0 text-uppercase tracking-wider">Daily Summary</h2>
                        <p className="small text-muted mb-0">Net Calories & Activity</p>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Calories In */}
                <div className="col-6 col-md-3">
                    <div className="d-flex flex-column align-items-center p-3 rounded-3 bg-light h-100">
                        <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                            <Utensils size={16} />
                            <span className="small fw-bold text-uppercase">Eaten</span>
                        </div>
                        <span className="h4 fw-bold mb-0">{caloriesIn}</span>
                        <span className="small text-muted">kcal</span>
                    </div>
                </div>

                {/* Calories Out */}
                <div className="col-6 col-md-3">
                    <div className="d-flex flex-column align-items-center p-3 rounded-3 bg-light h-100">
                        <div className="d-flex align-items-center gap-2 mb-2 text-warning">
                            <Flame size={16} />
                            <span className="small fw-bold text-uppercase">Burned</span>
                        </div>
                        <span className="h4 fw-bold mb-0">{caloriesOut}</span>
                        <span className="small text-muted">kcal</span>
                    </div>
                </div>

                {/* Net Calories */}
                <div className="col-6 col-md-3">
                    <div className="d-flex flex-column align-items-center p-3 rounded-3 bg-light h-100">
                        <div className="d-flex align-items-center gap-2 mb-2 text-info">
                            <Activity size={16} />
                            <span className="small fw-bold text-uppercase">Net</span>
                        </div>
                        <span className="h4 fw-bold mb-0">{netCalories}</span>
                        <span className="small text-muted">In - Out</span>
                    </div>
                </div>

                {/* Target */}
                <div className="col-6 col-md-3">
                    <div className="d-flex flex-column align-items-center p-3 rounded-3 bg-light h-100">
                        <div className="d-flex align-items-center gap-2 mb-2 text-success">
                            <Target size={16} />
                            <span className="small fw-bold text-uppercase">Goal</span>
                        </div>
                        <span className="h4 fw-bold mb-0">{targetCalories}</span>
                        <span className="small text-muted">kcal</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold text-muted">Progress towards goal</span>
                    <span className={`small fw-bold ${isOver ? 'text-danger' : 'text-primary'}`}>
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                    <div
                        className={`progress-bar ${getProgressColor()} rounded-pill`}
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    />
                </div>
            </div>

            {/* Recommendation */}
            <div className={`p-3 rounded-3 ${isOver ? 'bg-danger-soft' : 'bg-primary-soft'}`}>
                <div className="d-flex gap-2">
                    <span className="fs-5">{isOver ? '⚠️' : '💡'}</span>
                    <p className={`small mb-0 fw-medium ${isOver ? 'text-danger' : 'text-primary-dark'}`}>
                        {getRecommendation()}
                    </p>
                </div>
            </div>
        </div>
    );
}
