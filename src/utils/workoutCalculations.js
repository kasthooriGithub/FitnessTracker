/**
 * MET (Metabolic Equivalent of Task) values for different exercises and intensity levels
 * MET represents the energy cost of physical activities
 */
export const MET_VALUES = {
    walking: { low: 2.5, medium: 3.5, high: 4.5 },
    running: { low: 7.0, medium: 9.8, high: 11.5 },
    cycling: { low: 4.0, medium: 8.0, high: 10.0 },
    'strength training': { low: 3.0, medium: 5.0, high: 6.0 },
    yoga: { low: 2.0, medium: 2.5, high: 3.0 },
    swimming: { low: 6.0, medium: 8.0, high: 10.0 },
    cardio: { low: 4.0, medium: 6.0, high: 8.0 },
    hiit: { low: 6.0, medium: 8.0, high: 10.0 },
    pilates: { low: 2.5, medium: 3.0, high: 3.5 },
    crossfit: { low: 5.0, medium: 7.0, high: 9.0 },
    // Default for exercises not specifically listed
    default: { low: 3.0, medium: 5.0, high: 7.0 },
};

/**
 * Determines intensity level based on workout duration
 * @param {number} minutes - Duration of workout in minutes
 * @returns {string} - 'low', 'medium', or 'high'
 */
export function getIntensityFromDuration(minutes) {
    if (minutes <= 20) return 'low';
    if (minutes <= 45) return 'medium';
    return 'high';
}

/**
 * Calculates calories burned using MET formula
 * Formula: Calories = MET × weight(kg) × (duration(min) / 60)
 * 
 * @param {string} exerciseType - Type of exercise (e.g., 'running', 'walking')
 * @param {string} intensity - Intensity level ('low', 'medium', 'high')
 * @param {number} minutes - Duration in minutes
 * @param {number} weightKg - User's weight in kilograms
 * @returns {number} - Calculated calories burned (rounded)
 */
export function calculateCalories(exerciseType, intensity, minutes, weightKg) {
    // Normalize exercise type to lowercase and handle empty values
    const normalizedExercise = (exerciseType || '').toLowerCase().trim();

    // Get MET value for the exercise and intensity
    const exerciseMET = MET_VALUES[normalizedExercise] || MET_VALUES.default;
    const metValue = exerciseMET[intensity] || exerciseMET.medium;

    // Calculate calories: MET × weight × (minutes / 60)
    const calories = metValue * weightKg * (minutes / 60);

    // Return rounded value
    return Math.round(calories);
}

/**
 * Gets a human-readable description of the intensity level
 * @param {string} intensity - Intensity level
 * @returns {string} - Description
 */
export function getIntensityDescription(intensity) {
    const descriptions = {
        low: 'Light effort, comfortable pace',
        medium: 'Moderate effort, challenging but sustainable',
        high: 'High effort, pushing your limits',
    };
    return descriptions[intensity] || descriptions.medium;
}
