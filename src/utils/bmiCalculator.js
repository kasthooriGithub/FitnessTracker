/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {number|null} BMI value rounded to 1 decimal place, or null if invalid inputs
 */
export function calculateBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
        return null;
    }

    const heightMeters = heightCm / 100;
    const bmi = weightKg / (heightMeters * heightMeters);
    return Math.round(bmi * 10) / 10;
}

/**
 * Get BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {string} Category: "Underweight", "Normal", "Overweight", or "Obese"
 */
export function getBMICategory(bmi) {
    if (!bmi || bmi <= 0) return "Unknown";

    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

/**
 * Get personalized fitness recommendation based on goal and BMI category
 * @param {string} goal - Fitness goal: "lose", "gain", or "maintain"
 * @param {string} bmiCategory - BMI category
 * @returns {string} Personalized recommendation
 */
export function getGoalRecommendation(goal, bmiCategory) {
    const recommendations = {
        lose: {
            general: "Focus on a calorie deficit with light cardio and consistency. Track your meals and stay active daily.",
            Underweight: "Consider consulting a healthcare professional before pursuing weight loss.",
            Normal: "Maintain a slight calorie deficit with regular cardio and strength training.",
            Overweight: "Create a moderate calorie deficit, add 30 minutes of cardio daily, and stay consistent.",
            Obese: "Start with a sustainable calorie deficit, low-impact cardio, and consider professional guidance."
        },
        gain: {
            general: "Aim for a calorie surplus with strength training and adequate protein intake. Build muscle progressively.",
            Underweight: "Focus on a healthy calorie surplus with strength training and protein-rich meals.",
            Normal: "Combine a moderate calorie surplus with progressive strength training and high protein intake.",
            Overweight: "Focus on strength training to build muscle while maintaining current weight.",
            Obese: "Prioritize strength training and balanced nutrition. Consider recomposition over pure weight gain."
        },
        maintain: {
            general: "Keep balanced calories with mixed workouts. Maintain your current healthy habits.",
            Underweight: "Maintain current weight with balanced nutrition and regular exercise.",
            Normal: "Great! Keep your balanced diet and mix cardio with strength training.",
            Overweight: "Maintain weight while focusing on body composition through strength training.",
            Obese: "Focus on maintaining healthy habits while gradually improving body composition."
        }
    };

    const goalRecs = recommendations[goal];
    if (!goalRecs) return "Set your fitness goal to get personalized recommendations.";

    return goalRecs[bmiCategory] || goalRecs.general;
}

/**
 * Get color class for BMI category (Bootstrap compatible)
 * @param {string} category - BMI category
 * @returns {string} Bootstrap color class
 */
export function getBMICategoryColor(category) {
    const colors = {
        Underweight: "info",
        Normal: "success",
        Overweight: "warning",
        Obese: "danger",
        Unknown: "secondary"
    };

    return colors[category] || "secondary";
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - "male" or "female"
 * @returns {number} BMR value
 */
export function calculateBMR(weight, height, age, gender) {
    const baseCalc = 10 * weight + 6.25 * height - 5 * age;
    return gender === "male" ? baseCalc + 5 : baseCalc - 161;
}

/**
 * Calculate Daily Calorie Target based on BMR and Goal
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} goal - "lose_weight", "gain_weight", "maintain" (or mapped variations)
 * @returns {number} Daily calorie target
 */
export function calculateDailyCalories(bmr, goal) {
    // Normalize goal string to handle potential variations
    const normalizedGoal = goal?.toLowerCase().replace(" ", "_") || "maintain";

    if (normalizedGoal.includes("lose")) {
        return Math.round(bmr - 500); // Safe deficit
    } else if (normalizedGoal.includes("gain")) {
        return Math.round(bmr + 500); // Safe surplus
    } else {
        return Math.round(bmr); // Maintenance
    }
}
