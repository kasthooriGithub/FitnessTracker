import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy,
    updateDoc
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

export function useMealTemplates() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [templates, setTemplates] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTemplates([]);
            setPlans([]);
            setLoading(false);
            return;
        }

        const templatesQuery = query(
            collection(db, "meal_templates"),
            where("user_id", "==", user.uid)
        );

        const plansQuery = query(
            collection(db, "meal_plans"),
            where("user_id", "==", user.uid)
        );

        const unsubscribeTemplates = onSnapshot(templatesQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            data.sort((a, b) => {
                const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
                const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
                return timeB - timeA; // Descending
            });
            setTemplates(data);
        }, (error) => {
            console.error("Error fetching meal templates:", error);
        });

        const unsubscribePlans = onSnapshot(plansQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            data.sort((a, b) => {
                const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
                const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
                return timeB - timeA; // Descending
            });
            setPlans(data);
            setLoading(false); // Consider loading false when both or at least plans return
        }, (error) => {
            console.error("Error fetching meal plans:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeTemplates();
            unsubscribePlans();
        };
    }, [user]);

    const addTemplate = async (templateData) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "meal_templates"), {
                ...templateData,
                user_id: user.uid,
                created_at: serverTimestamp(),
            });
            toast({ title: "Template saved successfully!" });
        } catch (error) {
            toast({
                title: "Error saving template",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const deleteTemplate = async (id) => {
        try {
            await deleteDoc(doc(db, "meal_templates", id));
            toast({
                description: "Template deleted successfully!",
                });
        } catch (error) {
            toast({
                title: "Error deleting template",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const updateTemplate = async (id, updatedData) => {
        try {
            await updateDoc(doc(db, "meal_templates", id), updatedData);
            toast({
                description: "Template synced successfully!",
            });
        } catch (error) {
            toast({
                title: "Error syncing template",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const toggleTemplateFavorite = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "meal_templates", id), {
                is_favorite: !currentStatus
            });
        } catch (error) {
            toast({
                title: "Error updating favorite status",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const addPlan = async (planData) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "meal_plans"), {
                ...planData,
                user_id: user.uid,
                created_at: serverTimestamp(),
            });
            toast({
                description: "Meal plan saved successfully!",
                });
           
        } catch (error) {
            toast({
                title: "Error saving meal plan",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const deletePlan = async (id) => {
        try {
            await deleteDoc(doc(db, "meal_plans", id));
             toast({
                description: "Meal plan deleted!",
                });
            
        } catch (error) {
            toast({
                title: "Error deleting meal plan",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const updatePlan = async (id, updatedData) => {
        try {
            await updateDoc(doc(db, "meal_plans", id), updatedData);
            toast({
                description: "Meal plan synced successfully!",
            });
        } catch (error) {
            toast({
                title: "Error syncing meal plan",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const togglePlanFavorite = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "meal_plans", id), {
                is_favorite: !currentStatus
            });
        } catch (error) {
            toast({
                title: "Error updating favorite status",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return {
        templates,
        plans,
        loading,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        toggleTemplateFavorite,
        addPlan,
        updatePlan,
        deletePlan,
        togglePlanFavorite,
    };
}
