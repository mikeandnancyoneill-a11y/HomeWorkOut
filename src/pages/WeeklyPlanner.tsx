import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import WeeklyDayColumn from '../components/WeeklyDayColumn';
import WeeklyNav from '../components/WeeklyNav';
import { startOfWeek, addWeeks, format } from 'date-fns';

export type PlanItem = {
  id: string;
  user_id: string;
  week_start: string;       // YYYY-MM-DD
  day_of_week: number;      // 0..6 (Mon..Sun)
  exercise_id: number;
  target_sets: number;
  target_reps: number;
  target_weight: number | null;
  exercises?: { name: string };
};

export default function WeeklyPlanner() {
  const [userId, setUserId] = useState<string | null>(null);

  // Monday-based week start
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekStartStr = useMemo(
    () => format(currentWeekStart, 'yyyy-MM-dd'),
    [currentWeekStart]
  );

  const [itemsByDay, setItemsByDay] = useState<Record<number, PlanItem[]>>({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { data, error } = await supabase
        .from('weekly_plan')
        .select('id,user_id,week_start,day_of_week,exercise_id,target_sets,target_reps,target_weight,exercises(name)')
        .eq('user_id', userId)
        .eq('week_start', weekStartStr)
        .order('day_of_week', { ascending: true })
        .order('exercise_id', { ascending: true });

      if (error) {
        console.error('weekly_plan fetch error:', error);
        return;
      }

      const grouped: Record<number, PlanItem[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
      (data ?? []).forEach((row: any) => {
        grouped[row.day_of_week] = grouped[row.day_of_week] || [];
        grouped[row.day_of_week].push(row);
      });

      setItemsByDay(grouped);
    })();
  }, [userId, weekStartStr]);

  const handleWeekChange = (deltaWeeks: number) => {
    setCurrentWeekStart(addWeeks(currentWeekStart, deltaWeeks));
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>HomeWorkOut Weekly Plan</h1>

      <WeeklyNav onWeekChange={handleWeekChange} currentWeekStart={currentWeekStart} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {Array.from({ length: 7 }).map((_, day) => (
          <WeeklyDayColumn
            key={day}
            dayOfWeek={day}
            weekStart={weekStartStr}
            items={itemsByDay[day] ?? []}
            onSaved={() => {
              // Re-fetch by forcing state update
              setCurrentWeekStart(new Date(currentWeekStart));
            }}
          />
        ))}
      </div>
    </div>
  );
}
