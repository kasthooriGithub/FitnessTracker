import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Dumbbell } from "lucide-react";
import { calculateBMI, getBMICategory, calculateBMR, calculateDailyCalories } from "../utils/bmiCalculator";

export function BMISetupModal({ show, onHide, onSave, profile }) {
    const [heightCm, setHeightCm] = useState(profile?.height_cm || "");
    const [weightKg, setWeightKg] = useState(profile?.weightKg || "");
    const [age, setAge] = useState(profile?.age || "");
    const [gender, setGender] = useState(profile?.gender || "male");
    const [goal, setGoal] = useState(profile?.goal || "");

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!heightCm || heightCm <= 0) newErrors.heightCm = "Please enter a valid height";
        if (!weightKg || weightKg <= 0) newErrors.weightKg = "Please enter a valid weight";
        if (!age || age <= 0) newErrors.age = "Please enter a valid age";
        if (!goal) newErrors.goal = "Please select your fitness goal";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);

        const h = parseFloat(heightCm);
        const w = parseFloat(weightKg);
        const a = parseInt(age);

        // Calculate all metrics
        const bmi = calculateBMI(w, h);
        const bmiCategory = getBMICategory(bmi);
        const bmr = calculateBMR(w, h, a, gender);
        const dailyCalories = calculateDailyCalories(bmr, goal);

        await onSave({
            height_cm: h,
            weightKg: w,
            age: a,
            gender: gender,
            goal: goal,
            bmi: bmi,
            bmi_category: bmiCategory,
            bmr: Math.round(bmr),
            daily_calories_goal: dailyCalories,
            calories_calculated: true, // Mark as done
        });

        setSaving(false);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false} fullscreen="md-down">
            <Modal.Header>
                <Modal.Title className="fw-bold">Complete Your Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted mb-4">
                    We need a few details to calculate your BMI and daily calorie needs.
                </p>

                <Form>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Label className="fw-bold">Height (cm)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="e.g., 175"
                                value={heightCm}
                                onChange={(e) => setHeightCm(e.target.value)}
                                isInvalid={!!errors.heightCm}
                                className="input-modern"
                            />
                            <Form.Control.Feedback type="invalid">{errors.heightCm}</Form.Control.Feedback>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Label className="fw-bold">Weight (kg)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="e.g., 70"
                                value={weightKg}
                                onChange={(e) => setWeightKg(e.target.value)}
                                isInvalid={!!errors.weightKg}
                                className="input-modern"
                            />
                            <Form.Control.Feedback type="invalid">{errors.weightKg}</Form.Control.Feedback>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Label className="fw-bold">Age</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="e.g., 30"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                isInvalid={!!errors.age}
                                className="input-modern"
                            />
                            <Form.Control.Feedback type="invalid">{errors.age}</Form.Control.Feedback>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Label className="fw-bold">Gender</Form.Label>
                            <Form.Select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="input-modern"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </Form.Select>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Fitness Goal</Form.Label>
                        <Form.Select
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            isInvalid={!!errors.goal}
                            className="input-modern"
                        >
                            <option value="">Select your goal...</option>
                            <option value="lose_weight">Lose Weight</option>
                            <option value="gain_weight">Gain Weight</option>
                            <option value="maintain">Maintain Weight</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.goal}</Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-pill px-4 d-flex align-items-center gap-2"
                >
                    {saving ? (
                        <>
                            <Dumbbell className="animate-spin" size={18} />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <span>Save & Calculate BMI</span>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
