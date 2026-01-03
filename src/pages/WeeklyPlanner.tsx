import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import WeeklyDayColumn from '../components/WeeklyDayColumn';
import WeeklyNav from '../components/WeeklyNav';
import { startOfWeek, addWeeks, format } from 'date-fns';

export type PlanItem = {
  id: string;
  user_id: string;
  week_start: string;
  day_of_week: number; // 0..6 (Mon..Sun)
  exercise_id: number;

  target_sets: number;
  target_reps: number;
  target_weight: number | null;

  superset_group: number | null;
  superset_order: number | null;

  notes?: string | null;

  completed: boolean;
  actual_sets: number | null;
  actual_reps: number | null;
  actual_weight: number | null;
  locked_at: string | null;

  is_optional: boolean;

  exercises?: {
    name: string;
    video_url?: string | null;
    coaching_tips?: string | null;
  };
};

type DayMeta = {
  day_of_week: number;
  day_title: string;
  day_notes?: string | null;
};

export default function WeeklyPlanner() {
  const [userId, setUserId] = useState<string | null>(null);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekStartStr = useMemo(
    () => format(currentWeekStart, 'yyyy-MM-dd'),
    [currentWeekStart]
  );

  const [itemsByDay, setItemsByDay] = useState<Record<number, PlanItem[]>>({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  });

  const [metaByDay, setMetaByDay] = useState<Record<number, DayMeta>>({
    0: { day_of_week: 0, day_title: 'PUSH' },
    1: { day_of_week: 1, day_title: 'PULL' },
    2: { day_of_week: 2, day_title: 'LEGS' },
    3: { day_of_week: 3, day_title: 'UPPER' },
    4: { day_of_week: 4, day_title: 'FULL BODY' },
    5: { day_of_week: 5, day_title: 'RUN + MOBILITY' },
    6: { day_of_week: 6, day_title: 'RECOVERY' },
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  const refetch = async () => {
    if (!userId) return;

    // 1) weekly_plan
    const { data: plan, error: planErr } = await supabase
      .from('weekly_plan')
      .select(
        'id,user_id,week_start,day_of_week,exercise_id,target_sets,target_reps,target_weight,superset_group,superset_order,notes,completed,actual_sets,actual_reps,actual_weight,locked_at,is_optional,exercises(name,video_url,coaching_tips)'
      )
      .eq('user_id', userId)
      .eq('week_start', weekStartStr)
      .order('day_of_week', { ascending: true })
      .order('superset_group', { ascending: true })
      .order('superset_order', { ascending: true })
      .order('exercise_id', { ascending: true });

    if (planErr) {
      console.error('weekly_plan fetch error:', planErr);
      return;
    }

    const grouped: Record<number, PlanItem[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    (plan ?? []).forEach((row: any) => {
      grouped[row.day_of_week] = grouped[row.day_of_week] || [];
      grouped[row.day_of_week].push(row);
    });
    setItemsByDay(grouped);

    // 2) weekly_day_meta
    const { data: meta, error: metaErr } = await supabase
      .from('weekly_day_meta')
      .select('day_of_week, day_title, day_notes')
      .eq('user_id', userId)
      .eq('week_start', weekStartStr);

    if (metaErr) {
      console.error('weekly_day_meta fetch error:', metaErr);
      return;
    }

    const nextMeta: Record<number, DayMeta> = { ...metaByDay };
    (meta ?? []).forEach((m: any) => {
      nextMeta[m.day_of_week] = {
        day_of_week: m.day_of_week,
        day_title: m.day_title,
        day_notes: m.day_notes,
      };
    });
    setMetaByDay(nextMeta);
  };

  useEffect(() => {
    if (!userId) return;
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, weekStartStr]);

  const handleWeekChange = (deltaWeeks: number) => {
    setCurrentWeekStart(addWeeks(currentWeekStart, deltaWeeks));
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>HomeWorkOut Weekly Plan</h1>

      <WeeklyNav onWeekChange={handleWeekChange} currentWeekStart={currentWeekStart} />

      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(360px, 1fr))',
            gap: '0.75rem',
            minWidth: '2520px', // 7 * 360
            alignItems: 'start',
          }}
        >
          {Array.from({ length: 7 }).map((_, day) => (
            <WeeklyDayColumn
              key={day}
              dayOfWeek={day}
              weekStart={weekStartStr}
              dayTitle={metaByDay[day]?.day_title ?? ''}
              dayNotes={metaByDay[day]?.day_notes ?? null}
              items={itemsByDay[day] ?? []}
              onSaved={refetch}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
