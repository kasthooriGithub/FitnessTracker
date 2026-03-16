import { Activity } from "lucide-react";

export function BMICard({ profile }) {
    if (!profile?.bmi || !profile?.bmi_category) {
        return null;
    }

    const getBadgeClass = (category) => {
        const colors = {
            Underweight: "bg-info text-white",
            Normal: "bg-success text-white",
            Overweight: "bg-warning text-dark",
            Obese: "bg-danger text-white",
        };
        return colors[category] || "bg-secondary text-white";
    };

    const getRecommendation = () => {
        if (!profile?.goal) {
            return "Set your fitness goal in your profile to get personalized recommendations.";
        }

        const recommendations = {
            lose: {
                Underweight: "Consider consulting a healthcare professional before pursuing weight loss.",
                Normal: "Maintain a slight calorie deficit with regular cardio and strength training.",
                Overweight: "Create a moderate calorie deficit, add 30 minutes of cardio daily, and stay consistent.",
                Obese: "Start with a sustainable calorie deficit, low-impact cardio, and consider professional guidance.",
            },
            gain: {
                Underweight: "Focus on a healthy calorie surplus with strength training and protein-rich meals.",
                Normal: "Combine a moderate calorie surplus with progressive strength training and high protein intake.",
                Overweight: "Focus on strength training to build muscle while maintaining current weight.",
                Obese: "Prioritize strength training and balanced nutrition. Consider recomposition over pure weight gain.",
            },
            maintain: {
                Underweight: "Maintain current weight with balanced nutrition and regular exercise.",
                Normal: "Great! Keep your balanced diet and mix cardio with strength training.",
                Overweight: "Maintain weight while focusing on body composition through strength training.",
                Obese: "Focus on maintaining healthy habits while gradually improving body composition.",
            },
        };

        const goalRecs = recommendations[profile.goal];
        if (!goalRecs) {
            return "Focus on a balanced diet and regular exercise to achieve your fitness goals.";
        }

        return goalRecs[profile.bmi_category] || "Stay consistent with your fitness routine and track your progress.";
    };

    return (
        <div className="card-soft mb-4">
            <div className="d-flex align-items-center gap-3 mb-3">
                <div className="icon-square bg-primary-soft">
                    <Activity size={20} />
                </div>
                <div>
                    <h2 className="h5 fw-bold mb-0">Your BMI</h2>
                    <p className="muted mb-0">Body Mass Index</p>
                </div>
            </div>

            <div className="d-flex align-items-center gap-3 mb-3">
                <div className="h2 fw-bold mb-0">{profile.bmi}</div>
                <span className={`badge ${getBadgeClass(profile.bmi_category)} px-3 py-2`}>
                    {profile.bmi_category}
                </span>
            </div>

            <div className="p-3 rounded-3 bg-light">
                <p className="small mb-0 text-dark">
                    <strong>💡 Recommendation:</strong> {getRecommendation()}
                </p>
                <p className="small text-muted mb-0 mt-2">
                    <em>This is general advice, not medical guidance. Consult a healthcare professional for personalized recommendations.</em>
                </p>
            </div>
        </div>
    );
}
