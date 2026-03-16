import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, "profiles", user.uid);

    // Check if profile exists, if not create a default one
    const checkAndFetchProfile = async () => {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const defaultProfile = {
          id: user.uid,
          full_name: user.displayName || "",
          avatar_url: null,
          height_cm: null,
          current_weight_kg: null,
          weightKg: null, // Current weight for BMI calculation
          age: null,
          gender: null,
          fitness_goal: null,
          goal: null, // Fitness goal: "lose", "gain", or "maintain"
          target_weight_kg: null,
          bmi: null,
          bmi_category: null, // BMI category: "Underweight", "Normal", "Overweight", "Obese"
          bmr: null,
          recommended_daily_calories: null,
          calories_calculated: false,
          weight_goal_kg: null,
          daily_steps_goal: 10000,
          daily_calories_goal: 500,
          daily_water_goal_ml: 2000,
          weekly_workout_goal: 5,
          motivation: "",
          level_label: "Level 5 Athlete",
          created_at: new Date().toISOString()
        };
        await setDoc(docRef, defaultProfile);
      }
    };

    checkAndFetchProfile();

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
      }
      setLoading(false);
    }, (error) => {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateProfile = async (updates) => {
    if (!user) return;

    try {
      const docRef = doc(db, "profiles", user.uid);
      await updateDoc(docRef, updates);
      toast({ title: "Profile updated!" });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    loading,
    updateProfile,
  };
}
