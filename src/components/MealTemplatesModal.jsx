import React, { useState } from 'react';
import { Modal, Tabs, Tab, Button, Card } from 'react-bootstrap';
import { Heart, Utensils, Plus, Copy, Trash2, Star } from 'lucide-react';
import { useMealTemplates } from '../hooks/useMealTemplates';
import { useNutrition } from '../hooks/useNutrition';
export function MealTemplatesModal({ show, onHide }) {
  const { templates, plans, addTemplate, deleteTemplate, addPlan, deletePlan } = useMealTemplates();
  const { meals, addEntry, totals: currentTotals } = useNutrition();

  const [key, setKey] = useState('favorites');
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('Lunch');
  const [templateName, setTemplateName] = useState('');
  const [planName, setPlanName] = useState('');

  const mealTypes = [
    { label: 'Breakfast', count: meals?.Breakfast?.length || 0 },
    { label: 'Lunch', count: meals?.Lunch?.length || 0 },
    { label: 'Dinner', count: meals?.Dinner?.length || 0 },
    { label: 'Snacks', count: meals?.Snacks?.length || 0 }
  ];

  const totalTodayMeals = mealTypes.reduce((sum, m) => sum + m.count, 0);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    const items = meals[selectedMealType] || [];
    if (items.length === 0) return;

    const total_calories = items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    const total_protein = items.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
    const total_carbs = items.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
    const total_fat = items.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);

    await addTemplate({
        name: templateName,
        meal_type: selectedMealType,
        items,
        total_calories,
        total_protein,
        total_carbs,
        total_fat
    });
    setIsCreating(false);
    setTemplateName('');
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) return;
    const allItems = [...(meals?.Breakfast||[]), ...(meals?.Lunch||[]), ...(meals?.Dinner||[]), ...(meals?.Snacks||[])];
    if (allItems.length === 0) return;

    await addPlan({
        name: planName,
        entries: allItems,
        meal_counts: {
            Breakfast: meals?.Breakfast?.length || 0,
            Lunch: meals?.Lunch?.length || 0,
            Dinner: meals?.Dinner?.length || 0,
            Snacks: meals?.Snacks?.length || 0
        },
        total_calories: currentTotals.calories,
        total_protein: currentTotals.protein,
        total_carbs: currentTotals.carbs,
        total_fat: currentTotals.fat
    });
    setIsCreatingPlan(false);
    setPlanName('');
  };

  const handleCopyTemplate = async (template) => {
    for (const item of template.items) {
      const { id, created_at, user_id, entry_date, ...cleanItem } = item;
      await addEntry(cleanItem);
    }
    onHide();
  };

  const handleCopyPlan = async (plan) => {
    for (const item of plan.entries) {
      const { id, created_at, user_id, entry_date, ...cleanItem } = item;
      await addEntry(cleanItem);
    }
    onHide(); 
  };

  return (
    <Modal show={show} onHide={onHide} centered fullscreen="md-down">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2 fs-5 fw-bold">
          <Heart size={20} className="text-primary" />
          Meal Templates & Plans
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        <Tabs
          id="template-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="nav-pills nav-fill mb-4 bg-light rounded-pill p-1 border"
          style={{ '--bs-nav-pills-link-active-bg': '#fff', '--bs-nav-pills-link-active-color': '#000' }}
        >
          <Tab 
            eventKey="favorites" 
            title={
              <div className="d-flex align-items-center justify-content-center gap-2">
                <Star size={16} />
                Favorites
              </div>
            }
            tabClassName={`fw-medium rounded-pill ${key === 'favorites' ? 'shadow-sm text-dark' : 'text-muted'}`}
          >
            {!isCreating ? (
              <Button 
                variant="outline-light" 
                className="w-100 mb-3 py-2 border text-dark fw-bold d-flex align-items-center justify-content-center gap-2 border-dashed bg-white text-wrap" 
                style={{ borderStyle: 'dashed' }}
                onClick={() => setIsCreating(true)}
              >
                <Plus size={18} />
                Save Current Meal as Template
              </Button>
            ) : (
              <div className="border rounded-4 p-3 mb-3 shadow-sm bg-white">
                <input 
                  type="text" 
                  className="form-control rounded-pill border-light-subtle mb-3 px-3" 
                  placeholder="Template name (e.g., 'Power Breakfast')" 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
                
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {mealTypes.map((meal) => (
                    <button
                      key={meal.label}
                      className={`btn rounded-pill px-3 py-1 text-sm ${selectedMealType === meal.label ? 'btn-primary border-primary text-white fw-medium' : 'btn-outline-secondary border-light-subtle text-dark fw-medium bg-white'}`}
                      style={{ fontSize: '0.875rem' }}
                      onClick={() => setSelectedMealType(meal.label)}
                    >
                      {meal.label} ({meal.count})
                    </button>
                  ))}
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2 mt-3 mt-sm-1">
                  <Button variant="primary" className="rounded-pill flex-grow-1 fw-medium py-2" onClick={handleSaveTemplate} disabled={!templateName.trim() || meals?.[selectedMealType]?.length === 0}>
                    Save Template
                  </Button>
                  <Button variant="outline-light" className="rounded-pill border text-dark fw-medium px-4 bg-white py-2 flex-grow-1 flex-sm-grow-0" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {templates.length === 0 && !isCreating && (
              <div className="text-center text-muted py-4">No templates available.</div>
            )}
            
            {templates.map((template) => (
            <Card key={template.id} className="border shadow-sm rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1 fw-bold text-dark">{template.name}</h6>
                    <small className="text-muted">{template.meal_type} • {template.items.length} Items</small>
                  </div>
                  <div className="d-flex gap-2 mt-1">
                     <button className="btn btn-sm btn-link text-primary p-0 border-0 text-decoration-none" onClick={() => handleCopyTemplate(template)}>
                       <Copy size={18} />
                     </button>
                     <button className="btn btn-sm btn-link text-danger p-0 border-0 text-decoration-none" onClick={() => deleteTemplate(template.id)}>
                       <Trash2 size={18} />
                     </button>
                  </div>
                </div>
                <p className="text-muted small mb-3">{template.items.map(i => i.name).join(', ')}</p>
                <div className="d-flex align-items-center gap-3 small">
                  <span className="text-primary fw-bold">{template.total_calories} cal</span>
                  <span className="text-muted">{template.total_protein}g protein</span>
                </div>
              </Card.Body>
            </Card>
            ))}
          </Tab>
          <Tab 
            eventKey="plans" 
            title={
              <div className="d-flex align-items-center justify-content-center gap-2">
                <Utensils size={16} />
                Meal Plans
              </div>
            }
            tabClassName={`fw-medium rounded-pill ${key === 'plans' ? 'shadow-sm text-dark' : 'text-muted'}`}
          >
            {!isCreatingPlan ? (
              <Button 
                variant="outline-light" 
                className="w-100 mb-3 py-2 border text-dark fw-bold d-flex align-items-center justify-content-center gap-2 border-dashed bg-white text-wrap" 
                style={{ borderStyle: 'dashed' }}
                onClick={() => setIsCreatingPlan(true)}
              >
                <Plus size={18} />
                Save Today as Meal Plan
              </Button>
            ) : (
              <div className="border rounded-4 p-3 mb-3 shadow-sm bg-white border-light-subtle">
                <input 
                  type="text" 
                  className="form-control rounded-pill border-light-subtle mb-3 px-3" 
                  placeholder="Plan name (e.g., 'Cutting Day')" 
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
                
                <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                  This will save all {totalTodayMeals} meal(s) logged today as a reusable plan.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-2 mt-3 mt-sm-1">
                  <Button variant="primary" className="rounded-pill flex-grow-1 fw-medium py-2" onClick={handleSavePlan} disabled={!planName.trim() || totalTodayMeals === 0}>
                    Save Plan
                  </Button>
                  <Button variant="outline-light" className="rounded-pill border text-dark fw-medium px-4 bg-white py-2 flex-grow-1 flex-sm-grow-0" onClick={() => setIsCreatingPlan(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {plans.length === 0 && !isCreatingPlan && (
              <div className="text-center text-muted py-4">No meal plans available yet.</div>
            )}

            {plans.map((plan) => (
            <Card key={plan.id} className="border shadow-sm rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1 fw-bold text-dark">{plan.name}</h6>
                    <small className="text-muted">{plan.entries.length} items total</small>
                  </div>
                  <div className="d-flex gap-2 mt-1">
                     <button className="btn btn-sm btn-link text-primary p-0 border-0 text-decoration-none" onClick={() => handleCopyPlan(plan)}>
                       <Copy size={18} />
                     </button>
                     <button className="btn btn-sm btn-link text-danger p-0 border-0 text-decoration-none" onClick={() => deletePlan(plan.id)}>
                       <Trash2 size={18} />
                     </button>
                  </div>
                </div>
                <div className="text-muted small mb-3 mt-1 d-flex gap-2 align-items-center">
                  {plan.meal_counts?.Breakfast > 0 && <span>🌅 {plan.meal_counts.Breakfast}</span>}
                  {plan.meal_counts?.Lunch > 0 && <span>🌞 {plan.meal_counts.Lunch}</span>}
                  {plan.meal_counts?.Dinner > 0 && <span>🌙 {plan.meal_counts.Dinner}</span>}
                  {plan.meal_counts?.Snacks > 0 && <span>🍎 {plan.meal_counts.Snacks}</span>}
                </div>
                <div className="d-flex align-items-center gap-3 small">
                  <span className="text-primary fw-bold">{plan.total_calories} cal</span>
                  <span className="text-muted">{plan.total_protein}g protein</span>
                </div>
              </Card.Body>
            </Card>
            ))}
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
}
