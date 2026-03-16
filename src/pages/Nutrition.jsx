import React, { useState } from "react";
import { useNutrition } from "../hooks/useNutrition";
import { useProfile } from "../hooks/useProfile";
import { MacroRing } from "../components/MacroRing";
import { MealCard } from "../components/MealCard";
import { AddFoodDialog } from "../components/AddFoodDialog";
import { Plus, Heart, Utensils, Activity, Loader2 } from "lucide-react";

export default function Nutrition() {
    const { profile, loading: profileLoading } = useProfile();
    const { meals, totals, loading: nutritionLoading, addEntry } = useNutrition();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState("Breakfast");

    const calorieGoal = profile?.daily_calories_goal || 2000;
    const proteinGoal = profile?.protein_goal || 150;
    const carbsGoal = profile?.carbs_goal || 200;
    const fatGoal = profile?.fat_goal || 65;

    const remainingCal = calorieGoal - totals.calories;

    const handleOpenAdd = (mealType) => {
        setSelectedMeal(mealType);
        setShowAddModal(true);
    };

    const handleAddSubmit = async (foodData) => {
        await addEntry(foodData);
        setShowAddModal(false);
    };

    return (
        <div className="container py-4 py-lg-5" style={{ maxWidth: "1100px" }}>
            {/* Header section */}
            <div className="nt-header d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h1 className="nt-h1 fw-bold display-6 mb-1">Nutrition</h1>
                    <p className="nt-sub text-muted">Track your meals and macros</p>
                </div>
                <div className="nt-actions d-flex gap-2">
                    <button className="btn btn-outline-secondary border-light-subtle rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2 bg-white shadow-sm">
                        <Heart size={18} />
                        Templates
                    </button>
                    <button
                        className="btn btn-primary rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                        onClick={() => handleOpenAdd("Breakfast")}
                    >
                        <Plus size={20} />
                        Add Food
                    </button>
                </div>
            </div>

            {/* Summary card */}
            <div className="card nt-card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div className="row align-items-center">
                    <div className="col-12 col-lg-7">
                        <div className="nt-summaryLeft">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="nt-cardTitle fw-bold text-dark">Today's Calories</div>
                                <div className="text-muted small fw-medium">{remainingCal > 0 ? `${remainingCal} remaining` : `${Math.abs(remainingCal)} over`}</div>
                            </div>

                            <div className="nt-progressBar mb-3" style={{ height: "10px", backgroundColor: "#f1f3f5", borderRadius: "5px", overflow: "hidden" }}>
                                <div
                                    className="nt-progressFill h-100 bg-primary rounded-5"
                                    style={{ width: `${Math.min((totals.calories / calorieGoal) * 100, 100)}%`, transition: "width 0.8s ease-out" }}
                                ></div>
                            </div>

                            <div className="nt-calRow d-flex align-items-baseline gap-2">
                                <span className="nt-calBig fw-bold display-4 text-dark">{totals.calories}</span>
                                <span className="nt-calSmall text-muted fs-5 fw-medium">/ {calorieGoal} cal</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-5 mt-4 mt-lg-0">
                        <div className="nt-summaryRight d-flex justify-content-between justify-content-lg-around">
                            <MacroRing label="Protein" value={totals.protein} goal={proteinGoal} color="#0d6efd" />
                            <MacroRing label="Carbs" value={totals.carbs} goal={carbsGoal} color="#fd7e14" />
                            <MacroRing label="Fat" value={totals.fat} goal={fatGoal} color="#20c997" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Meals section */}
            <div className="row">
                <div className="col-12">
                    {["Breakfast", "Lunch", "Dinner"].map((mealType) => (
                        <MealCard
                            key={mealType}
                            title={mealType}
                            items={meals[mealType] || []}
                            onAdd={handleOpenAdd}
                        />
                    ))}
                </div>
            </div>

            {/* Basic Add Food Modal (Bootstrap style) */}
            {/* Smart Add Food Modal */}
            <AddFoodDialog
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onSave={handleAddSubmit}
                mealType={selectedMeal}
            />
        </div>
    );
}
