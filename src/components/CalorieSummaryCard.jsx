import { TrendingDown, TrendingUp, Minus, Calculator } from "lucide-react";

export function CalorieSummaryCard({ profile, onRecalculate }) {
    if (!profile?.calories_calculated) return null;

    const getGoalIcon = (goal) => {
        switch (goal) {
            case "lose_weight":
                return <TrendingDown size={20} className="text-danger" />;
            case "gain_weight":
                return <TrendingUp size={20} className="text-success" />;
            case "maintain":
                return <Minus size={20} className="text-primary" />;
            default:
                return <Minus size={20} className="text-primary" />;
        }
    };

    const getGoalLabel = (goal) => {
        const labels = {
            lose_weight: "Weight Loss",
            gain_weight: "Weight Gain",
            maintain: "Maintain Weight",
        };
        return labels[goal] || "Maintain Weight";
    };

    const getBMIColor = (bmi) => {
        if (bmi < 18.5) return "info";
        if (bmi < 25) return "success";
        if (bmi < 30) return "warning";
        return "danger";
    };

    return (
        <div className="card-soft mb-4">
            <div className="d-flex align-items-start justify-content-between mb-3">
                <div>
                    <h2 className="h6 fw-bold text-muted text-uppercase tracking-wider mb-2">
                        Your Calorie Plan
                    </h2>
                </div>
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={onRecalculate}
                    title="Recalculate"
                >
                    <Calculator size={16} />
                </button>
            </div>

            <div className="row g-3">
                <div className="col-md-4">
                    <div className="text-center p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">Daily Target</small>
                        <h3 className="h4 fw-bold text-primary mb-0">
                            {profile.recommended_daily_calories || profile.daily_calories_goal}{" "}
                            <small className="text-muted fw-normal">kcal</small>
                        </h3>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="text-center p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">Goal</small>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            {getGoalIcon(profile.fitness_goal)}
                            <span className="fw-bold">{getGoalLabel(profile.fitness_goal)}</span>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="text-center p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">BMI</small>
                        <h3 className="h4 fw-bold mb-0">
                            {profile.bmi?.toFixed(1) || "N/A"}
                            {profile.bmi && (
                                <span className={`badge bg-${getBMIColor(profile.bmi)} ms-2`} style={{ fontSize: '0.6rem' }}>
                                    {profile.bmi < 18.5 ? "Low" : profile.bmi < 25 ? "Normal" : profile.bmi < 30 ? "High" : "Very High"}
                                </span>
                            )}
                        </h3>
                    </div>
                </div>
            </div>

            {profile.target_weight_kg && (
                <div className="mt-3 p-2 bg-light rounded text-center">
                    <small className="text-muted">
                        Target Weight: <strong>{profile.target_weight_kg} kg</strong> | Current: <strong>{profile.current_weight_kg} kg</strong>
                    </small>
                </div>
            )}
        </div>
    );
}
