import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import WeeklyDayColumn from '../components/WeeklyDayColumn';
import WeeklyNav from '../components/WeeklyNav';
import { startOfWeek, addWeeks, format } from 'date-fns';

interface ExerciseLog {
  id?: number;
  workout_date: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_lb: number;
  rpe?: number;
  pain?: boolean;
  exercise_id: number;
}

export default function WeeklyPlanner() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weeklyData, setWeeklyData] = useState<Record<string, ExerciseLog[]>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchWeekly = async () => {
      const start = format(currentWeekStart, 'yyyy-MM-dd');
      const end = format(addWeeks(currentWeekStart, 1), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('workout_logs')
        .select(`*, exercises(name)`)
        .gte('workout_date', start)
        .lt('workout_date', end)
        .eq('user_id', userId)
        .order('workout_date', { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      const grouped: Record<string, ExerciseLog[]> = {};
      data?.forEach((log: any) => {
        const day = log.workout_date;
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push({
          ...log,
          exercise_name: log.exercises.name,
        });
      });
      setWeeklyData(grouped);
    };

    fetchWeekly();
  }, [currentWeekStart, userId]);

  const handleWeekChange = (weeks: number) => {
    setCurrentWeekStart(addWeeks(currentWeekStart, weeks));
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>HomeWorkout Weekly Planner</h1>
      <WeeklyNav onWeekChange={handleWeekChange} currentWeekStart={currentWeekStart} />
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const dayDate = new Date(currentWeekStart);
          dayDate.setDate(currentWeekStart.getDate() + i);
          const dayStr = format(dayDate, 'yyyy-MM-dd');
          return (
            <WeeklyDayColumn
              key={dayStr}
              date={dayDate}
              exercises={weeklyData[dayStr] || []}
              userId={userId}
              refreshWeek={() => setCurrentWeekStart(new Date(currentWeekStart))}
            />
          );
        })}
      </div>
    </div>
  );
}
