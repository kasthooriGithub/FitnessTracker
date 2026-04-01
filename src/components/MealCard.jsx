import React, { useState } from "react";
import { Plus, Utensils, Coffee, Sun, Moon, Trash2 } from "lucide-react";

export function MealCard({ title, items, onAdd, onDelete }) {
    const [hoveredId, setHoveredId] = useState(null);
    const totalCal = items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);

    const getIcon = () => {
        switch (title) {
            case "Breakfast": return <Coffee size={20} className="text-primary" />;
            case "Lunch": return <Sun size={20} className="text-warning" />;
            case "Dinner": return <Moon size={20} className="text-indigo" />;
            default: return <Utensils size={20} className="text-secondary" />;
        }
    };

    return (
        <div className="nt-meal nt-card shadow-sm border-0 rounded-4 p-4 mb-4">
            <div className="nt-mealHead d-flex justify-content-between align-items-start mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 bg-light rounded-3 d-flex align-items-center justify-content-center">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="nt-mealTitle mb-0">{title}</h3>
                        <span className="nt-mealSub text-muted small">{totalCal} cal</span>
                    </div>
                </div>
                <button
                    className="btn btn-link text-decoration-none p-0 fw-bold d-flex align-items-center gap-1"
                    onClick={() => onAdd(title)}
                    style={{ color: "#0d6efd" }}
                >
                    <Plus size={18} />
                    Add
                </button>
            </div>

            <div className="nt-mealList">
                {items.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                        {items.map((item) => (
                            <div 
                                key={item.id} 
                                className="nt-item d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border-0 transition-all"
                                onMouseEnter={() => setHoveredId(item.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <div>
                                    <div className="nt-itemName fw-bold text-dark">{item.name}</div>
                                    <div className="nt-itemSub text-muted small">{item.quantity}</div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="text-end">
                                        <div className="nt-itemCal fw-bold text-dark">{item.calories} cal</div>
                                        <div className="nt-itemMacro text-muted small" style={{ fontSize: "0.8rem" }}>P: {item.protein}g</div>
                                    </div>
                                    {hoveredId === item.id && onDelete && (
                                        <button 
                                            className="btn btn-sm btn-link text-danger p-0 rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10" 
                                            onClick={() => onDelete(item.id)}
                                            title="Delete item"
                                            style={{ width: "32px", height: "32px" }}
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="nt-empty text-muted text-center py-2">No items added yet</div>
                )}
            </div>
        </div>
    );
}
