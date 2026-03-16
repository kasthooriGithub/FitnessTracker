import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDailyLogs } from "../hooks/useDailyLogs";
import { useWorkouts } from "../hooks/useWorkouts";
import { useNutritionHistory } from "../hooks/useNutrition";
import { Dumbbell, Footprints, Droplets, Scale, Flame, Activity, Clock, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

export default function History() {
  const { logs, loading: logsLoading } = useDailyLogs();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { history: nutritionHistory, loading: nutritionLoading } = useNutritionHistory();
  const [dateRange, setDateRange] = useState("7days"); // today, 7days, 30days

  // --- Filtering Logic ---
  const getDateThreshold = () => {
    const date = new Date();
    if (dateRange === "today") return date; // Comparison will be exact match
    if (dateRange === "7days") date.setDate(date.getDate() - 7);
    if (dateRange === "30days") date.setDate(date.getDate() - 30);
    return date;
  };

  const filterByDate = (itemDateString) => {
    const itemDate = new Date(itemDateString);
    const todayStr = new Date().toISOString().split('T')[0];
    const threshold = getDateThreshold();

    if (dateRange === "today") {
      return itemDateString === todayStr;
    }
    // For ranges, we want items AFTER the threshold
    return itemDate >= threshold;
  };

  // Filtered Data
  const filteredLogs = useMemo(() => logs.filter(l => filterByDate(l.log_date)), [logs, dateRange]);
  const filteredWorkouts = useMemo(() => workouts.filter(w => filterByDate(w.workout_date)), [workouts, dateRange]);
  const filteredNutrition = useMemo(() => nutritionHistory.filter(n => filterByDate(n.entry_date)), [nutritionHistory, dateRange]);

  // --- Aggregation for Charts & Stats ---

  // 1. Group Nutrition by Date
  const nutritionByDate = useMemo(() => {
    return filteredNutrition.reduce((acc, item) => {
      const date = item.entry_date;
      if (!acc[date]) acc[date] = 0;
      acc[date] += (item.calories || 0);
      return acc;
    }, {});
  }, [filteredNutrition]);

  // 2. Group Workouts by Date
  const workoutsByDate = useMemo(() => {
    return filteredWorkouts.reduce((acc, w) => {
      const date = w.workout_date;
      if (!acc[date]) acc[date] = 0;
      acc[date] += (w.calories_burned || 0);
      return acc;
    }, {});
  }, [filteredWorkouts]);

  // 3. Prepare Chart Data (Merged)
  const chartData = useMemo(() => {
    const statsMap = {};

    // Initialize with logs (Steps, Water, Weight)
    filteredLogs.forEach(log => {
      if (!statsMap[log.log_date]) statsMap[log.log_date] = { date: log.log_date };
      statsMap[log.log_date].steps = log.steps || 0;
      statsMap[log.log_date].water = log.water_ml || 0;
      statsMap[log.log_date].weight = log.weight_kg;
    });

    // Merge Nutrition
    Object.entries(nutritionByDate).forEach(([date, cals]) => {
      if (!statsMap[date]) statsMap[date] = { date };
      statsMap[date].caloriesIn = cals;
    });

    // Merge Workouts
    Object.entries(workoutsByDate).forEach(([date, cals]) => {
      if (!statsMap[date]) statsMap[date] = { date };
      statsMap[date].caloriesOut = cals;
    });

    // Sort by date ascending for charts
    return Object.values(statsMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      }));
  }, [filteredLogs, nutritionByDate, workoutsByDate]);

  // --- KPI Calculations ---
  const totalWorkouts = filteredWorkouts.length;
  const totalCaloriesBurned = filteredWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const avgSteps = filteredLogs.length ? Math.round(filteredLogs.reduce((sum, l) => sum + (l.steps || 0), 0) / filteredLogs.length) : 0;

  const totalCaloriesEaten = filteredNutrition.reduce((sum, n) => sum + (n.calories || 0), 0);
  const avgCaloriesEaten = filteredLogs.length ? Math.round(totalCaloriesEaten / (dateRange === 'today' ? 1 : filteredLogs.length)) : totalCaloriesEaten;

  const statCards = [
    { icon: Dumbbell, value: totalWorkouts, label: "Workouts", bgColor: "rgba(13, 110, 253, 0.1)", iconColor: "text-primary" },
    { icon: Flame, value: totalCaloriesBurned.toLocaleString(), label: "Cals Burned", bgColor: "rgba(220, 53, 69, 0.1)", iconColor: "text-danger" },
    { icon: Footprints, value: avgSteps.toLocaleString(), label: "Avg Steps", bgColor: "rgba(25, 135, 84, 0.1)", iconColor: "text-success" },
    { icon: Clock, value: Math.round(totalDuration / 60), label: "Hours Active", bgColor: "rgba(102, 16, 242, 0.1)", iconColor: "text-indigo" },
  ];

  return (
    <div className="container py-4 py-lg-5" style={{ maxWidth: "1100px" }}>
      {/* Header & Controls */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h2 fw-bold mb-1">History & Progress</h1>
          <p className="text-muted mb-0">Track your journey over time</p>
        </div>

        <div className="btn-group bg-white shadow-sm rounded-3 p-1">
          <button
            className={`btn btn-sm rounded-2 fw-bold px-3 ${dateRange === 'today' ? 'btn-primary' : 'btn-light border-0 text-muted'}`}
            onClick={() => setDateRange('today')}
          >
            Today
          </button>
          <button
            className={`btn btn-sm rounded-2 fw-bold px-3 ${dateRange === '7days' ? 'btn-primary' : 'btn-light border-0 text-muted'}`}
            onClick={() => setDateRange('7days')}
          >
            Last 7 Days
          </button>
          <button
            className={`btn btn-sm rounded-2 fw-bold px-3 ${dateRange === '30days' ? 'btn-primary' : 'btn-light border-0 text-muted'}`}
            onClick={() => setDateRange('30days')}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-5">
        {statCards.map((stat, index) => (
          <div key={index} className="col-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm rounded-4">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{ width: '48px', height: '48px', backgroundColor: stat.bgColor }}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="h4 fw-bold mb-0 text-truncate">{stat.value}</p>
                    <p className="small text-muted mb-0 text-truncate">{stat.label}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-5">
        {/* Steps Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h5 className="h6 fw-bold d-flex align-items-center gap-2 mb-0">
                <Footprints className="text-success" size={20} /> Steps Activity
              </h5>
            </div>
            <div className="card-body p-4">
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#adb5bd' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="steps" fill="#198754" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Calories Comparison Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h5 className="h6 fw-bold d-flex align-items-center gap-2 mb-0">
                <Flame className="text-danger" size={20} /> Calories: In vs Out
              </h5>
            </div>
            <div className="card-body p-4">
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc3545" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#dc3545" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#adb5bd' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="caloriesOut" stroke="#dc3545" fillOpacity={1} fill="url(#colorOut)" name="Burned" />
                    <Area type="monotone" dataKey="caloriesIn" stroke="#0d6efd" fillOpacity={1} fill="url(#colorIn)" name="Eaten" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Trend */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h5 className="h6 fw-bold d-flex align-items-center gap-2 mb-0">
                <Scale className="text-warning" size={20} /> Weight Trend
              </h5>
            </div>
            <div className="card-body p-4">
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <LineChart data={chartData.filter(d => d.weight)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#adb5bd' }} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#adb5bd' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="weight" stroke="#ffc107" strokeWidth={3} dot={{ r: 4, fill: "#ffc107" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Water Intake */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h5 className="h6 fw-bold d-flex align-items-center gap-2 mb-0">
                <Droplets className="text-info" size={20} /> Water Intake
              </h5>
            </div>
            <div className="card-body p-4">
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#adb5bd' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="water" fill="#0dcaf0" radius={[4, 4, 0, 0]} name="Water (ml)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Lists */}
      <div className="row g-4">
        {/* Workout History */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 p-4">
              <h5 className="h6 fw-bold mb-0">Workout History</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {filteredWorkouts.length > 0 ? (
                  filteredWorkouts.sort((a, b) => new Date(b.workout_date) - new Date(a.workout_date)).map(workout => (
                    <div key={workout.id} className="list-group-item border-0 px-4 py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-2 rounded-3 bg-light text-primary">
                            <Activity size={18} />
                          </div>
                          <div>
                            <p className="fw-bold mb-0 text-dark">{workout.workout_type}</p>
                            <p className="small text-muted mb-0">{new Date(workout.workout_date).toLocaleDateString()} • {workout.duration_minutes} min</p>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-soft-danger text-danger rounded-pill px-3">
                            {workout.calories_burned} kcal
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-center text-muted">No workouts found in this period.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition History */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 p-4">
              <h5 className="h6 fw-bold mb-0">Daily Nutrition Log</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {Object.keys(nutritionByDate).length > 0 ? (
                  Object.entries(nutritionByDate)
                    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                    .map(([date, calories]) => (
                      <div key={date} className="list-group-item border-0 px-4 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3">
                            <div className="p-2 rounded-3 bg-light text-success">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="fw-bold mb-0 text-dark">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                              <p className="small text-muted mb-0">Total logged</p>
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-soft-success text-success rounded-pill px-3">
                              {calories} kcal
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-5 text-center text-muted">No nutrition logs found in this period.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
