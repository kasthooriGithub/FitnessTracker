import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  orderBy,
  getDocs,
  limit
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

export function useDailyLogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todayLog, setTodayLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setTodayLog(null);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "daily_logs"),
      where("user_id", "==", user.uid),
      orderBy("log_date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logData);
      setTodayLog(logData.find((log) => log.log_date === today) || null);
      setLoading(false);
    }, (error) => {
      toast({
        title: "Error fetching logs",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateLog = async (field, value) => {
    if (!user) return;

    try {
      if (todayLog) {
        const logRef = doc(db, "daily_logs", todayLog.id);
        await updateDoc(logRef, { [field]: value });
      } else {
        // Use a unique ID based on user and date to prevent duplicates
        const logId = `${user.uid}_${today}`;
        await setDoc(doc(db, "daily_logs", logId), {
          user_id: user.uid,
          log_date: today,
          [field]: value,
          steps: field === "steps" ? value : 0,
          water_ml: field === "water_ml" ? value : 0,
          weight_kg: field === "weight_kg" ? value : null,
        });
      }

      toast({ title: "Updated successfully!" });
    } catch (error) {
      toast({
        title: "Error updating",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    todayLog,
    logs,
    loading,
    updateLog,
  };
}
