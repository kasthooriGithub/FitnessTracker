import React, { useState } from "react";
import { useNutrition } from "../hooks/useNutrition";
import { useProfile } from "../hooks/useProfile";
import { MacroRing } from "../components/MacroRing";
import { MealCard } from "../components/MealCard";
import { AddFoodDialog } from "../components/AddFoodDialog";
import { MealTemplatesModal } from "../components/MealTemplatesModal";
import { Plus, Heart, Utensils, Activity, Loader2, Coffee, Sun, Moon, Apple } from "lucide-react";
import { Modal } from "react-bootstrap";

export default function Nutrition() {
    const { profile, loading: profileLoading } = useProfile();
    const { meals, totals, loading: nutritionLoading, addEntry, deleteEntry } = useNutrition();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [showMealSelectModal, setShowMealSelectModal] = useState(false);
    
    // Remember last selected meal using lazy initialization
    const [lastSelectedMeal, setLastSelectedMeal] = useState(() => {
        return localStorage.getItem("lastSelectedMeal") || "Breakfast";
    });
    const [selectedMeal, setSelectedMeal] = useState(lastSelectedMeal);

    const mealCategories = [
        { name: "Breakfast", icon: Coffee, desc: "Morning fuel" },
        { name: "Lunch", icon: Sun, desc: "Midday energy" },
        { name: "Dinner", icon: Moon, desc: "Evening meal" },
        { name: "Snacks", icon: Apple, desc: "Quick bites" },
    ];

    const calorieGoal = profile?.daily_calories_goal || 2000;
    const proteinGoal = profile?.protein_goal || 150;
    const carbsGoal = profile?.carbs_goal || 200;
    const fatGoal = profile?.fat_goal || 65;

    const remainingCal = calorieGoal - totals.calories;

    const handleOpenAdd = (mealType) => {
        setSelectedMeal(mealType);
        setShowAddModal(true);
    };

    const handleMealSelect = (mealName) => {
        setLastSelectedMeal(mealName);
        localStorage.setItem("lastSelectedMeal", mealName);
        setShowMealSelectModal(false);
        handleOpenAdd(mealName);
    };

    const handleAddSubmit = async (foodData) => {
        await addEntry(foodData);
        setShowAddModal(false);
    };

    return (
        <div className="container py-4 py-lg-5" style={{ maxWidth: "1100px" }}>
            {/* Header section */}
            <div className="nt-header d-flex flex-column flex-md-row justify-content-between align-items-md-center align-items-start mb-4 gap-3 gap-md-0">
                <div>
                    <h1 className="nt-h1 fw-bold display-6 mb-1">Nutrition</h1>
                    <p className="nt-sub text-muted mb-0">Track your meals and macros</p>
                </div>
                <div className="nt-actions w-100 w-md-auto d-flex gap-2 justify-content-start justify-content-md-end" style={{ flex: '1 1 auto', maxWidth: '100%' }}>
                    <button 
                        className="btn btn-outline-secondary border-light-subtle rounded-3 px-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 bg-white shadow-sm flex-grow-1 flex-md-grow-0"
                        onClick={() => setShowTemplatesModal(true)}
                    >
                        <Heart size={18} />
                        Templates
                    </button>
                    <button
                        className="btn btn-primary rounded-3 px-3 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm flex-grow-1 flex-md-grow-0"
                        onClick={() => setShowMealSelectModal(true)}
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
                        <div className="nt-summaryRight d-flex flex-wrap justify-content-center justify-content-sm-between justify-content-lg-around gap-3 gap-sm-0 text-center">
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
                    {["Breakfast", "Lunch", "Dinner", "Snacks"].map((mealType) => (
                        <MealCard
                            key={mealType}
                            title={mealType}
                            items={meals[mealType] || []}
                            onAdd={handleOpenAdd}
                            onDelete={deleteEntry}
                        />
                    ))}
                </div>
            </div>

            {/* Smart Add Food Modal */}
            <AddFoodDialog
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onSave={handleAddSubmit}
                mealType={selectedMeal}
            />

            <MealTemplatesModal 
                show={showTemplatesModal} 
                onHide={() => setShowTemplatesModal(false)} 
            />

            {/* Meal Selection Modal */}
            <Modal show={showMealSelectModal} onHide={() => setShowMealSelectModal(false)} centered scrollable>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <Utensils className="text-primary" size={24} />
                        When did you eat?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2 pb-4 px-4">
                    <p className="text-muted mb-4 small">Select a meal category to log your food.</p>
                    <div className="d-flex flex-column gap-3">
                        {mealCategories.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = lastSelectedMeal === cat.name;
                            return (
                                <div 
                                    key={cat.name}
                                    onClick={() => handleMealSelect(cat.name)}
                                    className={`d-flex align-items-center p-3 rounded-4 transition-all border ${isSelected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-light border-light-subtle text-dark'}`}
                                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                    onMouseOver={(e) => {
                                        if(!isSelected) e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                        if(!isSelected) e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div className={`p-3 rounded-circle d-flex align-items-center justify-content-center me-3 ${isSelected ? 'bg-white bg-opacity-25' : 'bg-white border shadow-sm'}`}>
                                        <Icon size={24} className={isSelected ? 'text-white' : 'text-primary'} />
                                    </div>
                                    <div>
                                        <h5 className="mb-0 fw-bold">{cat.name}</h5>
                                        <small className={isSelected ? 'text-white text-opacity-75' : 'text-muted fw-medium'}>{cat.desc}</small>
                                    </div>
                                    {isSelected && (
                                        <div className="ms-auto bg-white text-primary rounded-circle d-flex p-1 shadow-sm">
                                            <Utensils size={14} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
