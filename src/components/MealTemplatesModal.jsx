import React, { useState } from 'react';
import { Modal, Tabs, Tab, Button, Card } from 'react-bootstrap';
import { Heart, Utensils, Plus, Copy, Trash2, Star, RefreshCw } from 'lucide-react';
import { useMealTemplates } from '../hooks/useMealTemplates';
import { useNutrition } from '../hooks/useNutrition';
export function MealTemplatesModal({ show, onHide }) {
  const { templates, plans, addTemplate, deleteTemplate, toggleTemplateFavorite, addPlan, deletePlan, togglePlanFavorite, updateTemplate, updatePlan } = useMealTemplates();
  const { meals, addEntry, totals: currentTotals } = useNutrition();

  const [key, setKey] = useState('favorites');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  
  const [ignoredUpdates, setIgnoredUpdates] = useState({});
  const [syncTarget, setSyncTarget] = useState(null);

  const getItemsHash = (items) => {
      if (!items) return "";
      return items.map(i => `${i.name}-${i.calories}`).sort().join('|');
  };

  const allCurrentItems = [...(meals?.Breakfast||[]), ...(meals?.Lunch||[]), ...(meals?.Dinner||[]), ...(meals?.Snacks||[])];
  const currentPlanHash = getItemsHash(allCurrentItems);

  const mealTypes = [
    { label: 'Breakfast', count: meals?.Breakfast?.length || 0 },
    { label: 'Lunch', count: meals?.Lunch?.length || 0 },
    { label: 'Dinner', count: meals?.Dinner?.length || 0 },
    { label: 'Snacks', count: meals?.Snacks?.length || 0 }
  ];

  const totalTodayMeals = mealTypes.reduce((sum, m) => sum + m.count, 0);



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

  const handleSyncClicked = (type, item) => {
      setSyncTarget({ type, item });
  };

  const handleIgnoreSync = () => {
      if (!syncTarget) return;
      const { type, item } = syncTarget;
      let currentItemsHash = "";
      if (type === 'template') {
           currentItemsHash = getItemsHash(meals[item.meal_type] || []);
      } else {
           currentItemsHash = currentPlanHash;
      }
      
      setIgnoredUpdates(prev => ({
          ...prev,
          [item.id]: currentItemsHash
      }));
      setSyncTarget(null);
  };

  const handleUpdateSync = async () => {
      if (!syncTarget) return;
      const { type, item } = syncTarget;
      
      if (type === 'template') {
          const currentItems = meals[item.meal_type] || [];
          const total_calories = currentItems.reduce((sum, i) => sum + (Number(i.calories) || 0), 0);
          const total_protein = currentItems.reduce((sum, i) => sum + (Number(i.protein) || 0), 0);
          const total_carbs = currentItems.reduce((sum, i) => sum + (Number(i.carbs) || 0), 0);
          const total_fat = currentItems.reduce((sum, i) => sum + (Number(i.fat) || 0), 0);
          
          await updateTemplate(item.id, {
              items: currentItems,
              total_calories, total_protein, total_carbs, total_fat
          });
      } else {
          await updatePlan(item.id, {
              entries: allCurrentItems,
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
      }
      setSyncTarget(null);
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

            {templates.filter(t => t.is_favorite !== false).length === 0 && plans.filter(p => p.is_favorite).length === 0 && (
              <div className="text-center text-muted py-4">No favorites available.</div>
            )}
            
            {templates.filter(t => t.is_favorite !== false).map((template) => {
              const currentMealItems = meals[template.meal_type] || [];
              const diffExists = currentMealItems.length > 0 && getItemsHash(template.items) !== getItemsHash(currentMealItems);
              const showSync = diffExists && ignoredUpdates[template.id] !== getItemsHash(currentMealItems);
              
              return (
            <Card key={template.id} className="border shadow-sm rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1 fw-bold text-dark">{template.name}</h6>
                    <small className="text-muted">{template.meal_type} • {template.items.length} Items</small>
                  </div>
                  <div className="d-flex gap-2 mt-1">
                     {showSync && (
                       <button className="btn btn-sm btn-link text-info p-0 border-0 text-decoration-none" onClick={() => handleSyncClicked('template', template)} title="Sync with current meal">
                         <RefreshCw size={18} />
                       </button>
                     )}
                     <button className="btn btn-sm btn-link p-0 border-0 text-decoration-none" onClick={() => toggleTemplateFavorite(template.id, template.is_favorite !== false)}>
                       <Heart size={18} className="text-danger" fill="currentColor" />
                     </button>
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
            )})}

            {plans.filter(p => p.is_favorite).map((plan) => {
              const diffExists = allCurrentItems.length > 0 && getItemsHash(plan.entries) !== currentPlanHash;
              const showSync = diffExists && ignoredUpdates[plan.id] !== currentPlanHash;

              return (
            <Card key={`fav-${plan.id}`} className="border shadow-sm rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1 fw-bold text-dark">{plan.name}</h6>
                    <small className="text-muted">Meal Plan • {plan.entries.length} items</small>
                  </div>
                  <div className="d-flex gap-2 mt-1">
                     {showSync && (
                       <button className="btn btn-sm btn-link text-info p-0 border-0 text-decoration-none" onClick={() => handleSyncClicked('plan', plan)} title="Sync with current day">
                         <RefreshCw size={18} />
                       </button>
                     )}
                     <button className="btn btn-sm btn-link p-0 border-0 text-decoration-none" onClick={() => togglePlanFavorite(plan.id, plan.is_favorite)}>
                       <Heart size={18} className="text-danger" fill="currentColor" />
                     </button>
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
            )})}
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
            {!isCreatingPlan && (
              <Button 
                variant="outline-light" 
                className="w-100 mb-3 py-2 border text-dark fw-bold d-flex align-items-center justify-content-center gap-2 border-dashed bg-white text-wrap" 
                style={{ borderStyle: 'dashed' }}
                onClick={() => setIsCreatingPlan(true)}
              >
                <Plus size={18} />
                Save Today as Meal Plan
              </Button>
            )}

            {isCreatingPlan && (
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

            {plans.map((plan) => {
              const diffExists = allCurrentItems.length > 0 && getItemsHash(plan.entries) !== currentPlanHash;
              const showSync = diffExists && ignoredUpdates[plan.id] !== currentPlanHash;

              return (
            <Card key={plan.id} className="border shadow-sm rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1 fw-bold text-dark">{plan.name}</h6>
                    <small className="text-muted">{plan.entries.length} items total</small>
                  </div>
                  <div className="d-flex gap-2 mt-1">
                     {showSync && (
                       <button className="btn btn-sm btn-link text-info p-0 border-0 text-decoration-none" onClick={() => handleSyncClicked('plan', plan)} title="Sync with current day">
                         <RefreshCw size={18} />
                       </button>
                     )}
                     <button className="btn btn-sm btn-link p-0 border-0 text-decoration-none" onClick={() => togglePlanFavorite(plan.id, plan.is_favorite)}>
                       <Heart size={18} className={plan.is_favorite ? "text-danger" : "text-muted"} fill={plan.is_favorite ? "currentColor" : "none"} />
                     </button>
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
            )})}
          </Tab>
        </Tabs>
      </Modal.Body>

      {/* Sync Confirmation Modal */}
      <Modal show={syncTarget !== null} onHide={() => setSyncTarget(null)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <RefreshCw className="text-primary" size={24} />
            Sync Update
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 pb-4">
          <p className="mb-4">
            Your current meal data has changed. Do you want to update this {syncTarget?.type} with the latest foods, calories, and macros?
          </p>
          <div className="d-flex flex-column gap-2">
            <Button variant="primary" className="rounded-pill fw-bold" onClick={handleUpdateSync}>
              Update Template
            </Button>
            <Button variant="outline-secondary" className="rounded-pill fw-medium" onClick={handleIgnoreSync}>
              Ignore
            </Button>
            <Button variant="link" className="text-muted text-decoration-none fw-medium" onClick={() => setSyncTarget(null)}>
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

    </Modal>
  );
}
