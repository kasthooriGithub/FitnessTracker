import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { getStartDateString } from "../utils/dateFilters";

export function useWorkouts(dateRange = "alltime") {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    let q;
    const startDate = getStartDateString(dateRange);
    
    if (startDate) {
       q = query(
         collection(db, "workouts"),
         where("user_id", "==", user.uid),
         where("workout_date", ">=", startDate)
       );
    } else {
       q = query(
         collection(db, "workouts"),
         where("user_id", "==", user.uid)
       );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workoutData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side sort by date descending
      workoutData.sort((a, b) => new Date(b.workout_date) - new Date(a.workout_date));

      setWorkouts(workoutData);
      setLoading(false);
    }, (error) => {
      toast({
        title: "Error fetching workouts",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addWorkout = async (workout) => {
    if (!user) return;

    try {
      await addDoc(collection(db, "workouts"), {
        ...workout,
        user_id: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Workout saved successfully!",
        description: `${workout.workout_type} (${workout.category}) - ${workout.duration_minutes} minutes`,
      });
    } catch (error) {
      toast({
        title: "Error adding workout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateWorkout = async (workout) => {
    try {
      const workoutRef = doc(db, "workouts", workout.id);
      const { id, ...data } = workout;
      await updateDoc(workoutRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Workout updated!",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating workout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteWorkout = async (id) => {
    try {
      await deleteDoc(doc(db, "workouts", id));
      toast({
        title: "Workout deleted",
        description: "The workout has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error deleting workout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const todaysWorkouts = workouts.filter(
    (w) => w.workout_date === new Date().toISOString().split("T")[0]
  );

  const todaysTotalCalories = todaysWorkouts.reduce(
    (sum, w) => sum + (w.calories_burned || 0),
    0
  );

  const todaysTotalMinutes = todaysWorkouts.reduce(
    (sum, w) => sum + w.duration_minutes,
    0
  );

  return {
    workouts,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    todaysWorkouts,
    todaysTotalCalories,
    todaysTotalMinutes,
  };
}
