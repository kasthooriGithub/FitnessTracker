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
    orderBy
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

export function useNutrition(selectedDate = new Date().toISOString().split("T")[0]) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setEntries([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "nutrition_entries"),
            where("user_id", "==", user.uid),
            where("entry_date", "==", selectedDate)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entryData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side to avoid composite index requirement
            entryData.sort((a, b) => {
                const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
                const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
                return timeA - timeB;
            });

            setEntries(entryData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching nutrition entries:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, selectedDate]);

    const addEntry = async (entry) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "nutrition_entries"), {
                ...entry,
                user_id: user.uid,
                entry_date: selectedDate,
                created_at: serverTimestamp(),
            });
            toast({ title: "Entry added successfully!" });
        } catch (error) {
            toast({
                title: "Error adding entry",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const deleteEntry = async (id) => {
        try {
            await deleteDoc(doc(db, "nutrition_entries", id));
            toast({ title: "Entry deleted" });
        } catch (error) {
            toast({
                title: "Error deleting entry",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    // Grouping and Totals
    const meals = {
        Breakfast: entries.filter(e => e.meal_type === "Breakfast"),
        Lunch: entries.filter(e => e.meal_type === "Lunch"),
        Dinner: entries.filter(e => e.meal_type === "Dinner"),
        Snacks: entries.filter(e => e.meal_type === "Snacks"),
    };

    const totals = entries.reduce((acc, curr) => ({
        calories: acc.calories + (Number(curr.calories) || 0),
        protein: acc.protein + (Number(curr.protein) || 0),
        carbs: acc.carbs + (Number(curr.carbs) || 0),
        fat: acc.fat + (Number(curr.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
        entries,
        meals,
        totals,
        loading,
        addEntry,
        deleteEntry,
    };
}

export function useNutritionHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setHistory([]);
            setLoading(false);
            return;
        }

        // Fetch last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateString = thirtyDaysAgo.toISOString().split('T')[0];

        const q = query(
            collection(db, "nutrition_entries"),
            where("user_id", "==", user.uid),
            where("entry_date", ">=", dateString)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort by date descending
            data.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));

            setHistory(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching nutrition history:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { history, loading };
}
