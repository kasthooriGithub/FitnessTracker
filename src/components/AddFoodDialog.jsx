import { useState, useEffect } from "react";
import { commonFoods } from "../data/foods";

export function AddFoodDialog({ show, onHide, onSave, mealType }) {
    const [foodName, setFoodName] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Macro state
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");

    // Internal state to track if we are in "manual mode" or "auto mode"
    const [isAutoValues, setIsAutoValues] = useState(false);
    const [baseValues, setBaseValues] = useState(null); // { calories, protein, carbs, fat } per 1 unit

    // Reset when modal opens
    useEffect(() => {
        if (show) {
            setFoodName("");
            setQuantity(1);
            setCalories("");
            setProtein("");
            setCarbs("");
            setFat("");
            setIsAutoValues(false);
            setBaseValues(null);
        }
    }, [show]);

    // Handle food name change and lookup
    const handleFoodChange = (e) => {
        const name = e.target.value;
        setFoodName(name);

        // Try to find exact match (case insensitive)
        const food = commonFoods.find(f => f.name.toLowerCase() === name.toLowerCase());

        if (food) {
            // Found a food! Set base values and calculate
            setBaseValues({
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                unit: food.per
            });
            setIsAutoValues(true);
            // Trigger calculation
            updateCalculatedValues(food, quantity);
        } else {
            // If user clears input or types something new, we don't clear macros immediately 
            // to allow manual correction, but we stop auto-calculation updates if no match
            setIsAutoValues(false);
            setBaseValues(null);
        }
    };

    // Recalculate when quantity changes (if we have a base food)
    const handleQuantityChange = (e) => {
        const qty = parseFloat(e.target.value) || 0;
        setQuantity(qty);

        if (baseValues) {
            updateCalculatedValues(baseValues, qty);
        }
    };

    const updateCalculatedValues = (base, qty) => {
        setCalories(Math.round(base.calories * qty));
        setProtein(Math.round(base.protein * qty));
        setCarbs(Math.round(base.carbs * qty));
        setFat(Math.round(base.fat * qty));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name: foodName,
            meal_type: mealType,
            calories: parseInt(calories) || 0,
            protein: parseInt(protein) || 0,
            carbs: parseInt(carbs) || 0,
            fat: parseInt(fat) || 0,
            quantity: baseValues ? `${quantity} x ${baseValues.unit}` : `${quantity} serving`
        });
        onHide();
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">Add to {mealType}</h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4 pt-3">
                            {/* Food Search */}
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Food Name</label>
                                <input
                                    type="text"
                                    list="food-suggestions"
                                    className="form-control rounded-3"
                                    placeholder="Start typing to search..."
                                    value={foodName}
                                    onChange={handleFoodChange}
                                    autoFocus
                                    required
                                />
                                <datalist id="food-suggestions">
                                    {commonFoods.map((food, index) => (
                                        <option key={index} value={food.name}>
                                            {food.name} ({food.calories} cal / {food.per})
                                        </option>
                                    ))}
                                </datalist>
                                {baseValues && (
                                    <div className="form-text text-success">
                                        <small>✓ Found: {baseValues.unit} contains {baseValues.calories} cal</small>
                                    </div>
                                )}
                                {!baseValues && foodName.length > 2 && (
                                    <div className="form-text text-muted">
                                        <small>Food not found? Enter values manually below.</small>
                                    </div>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Quantity / Servings</label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        className="form-control rounded-3"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        required
                                    />
                                    {baseValues && <span className="text-muted small text-nowrap">x {baseValues.unit}</span>}
                                </div>
                            </div>

                            {/* Macros Grid */}
                            <div className="p-3 bg-light rounded-3">
                                <label className="form-label small fw-bold mb-2">Nutritional Values (Auto-calculated)</label>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <label className="form-label small text-muted mb-0">Calories</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-white"
                                            value={calories}
                                            onChange={(e) => setCalories(e.target.value)}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-muted mb-0">Protein (g)</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-white"
                                            value={protein}
                                            onChange={(e) => setProtein(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-muted mb-0">Carbs (g)</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-white"
                                            value={carbs}
                                            onChange={(e) => setCarbs(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-muted mb-0">Fat (g)</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-white"
                                            value={fat}
                                            onChange={(e) => setFat(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0 p-4 pt-0">
                            <button type="button" className="btn btn-light rounded-3 px-4 fw-bold" onClick={onHide}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-3 px-4 fw-bold">Save Entry</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
