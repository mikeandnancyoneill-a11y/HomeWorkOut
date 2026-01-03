import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PlanItem } from '../pages/WeeklyPlanner';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyDayColumn({
  dayOfWeek,
  weekStart,
  dayTitle,
  dayNotes,
  items,
  onSaved,
}: {
  dayOfWeek: number;
  weekStart: string;
  dayTitle: string;
  dayNotes: string | null;
  items: PlanItem[];
  onSaved: () => void;
}) {
  const [local, setLocal] = useState<PlanItem[]>(items);

  useEffect(() => setLocal(items), [items]);

  const updateField = (idx: number, field: keyof PlanItem, value: any) => {
    const next = [...local];
    (next[idx] as any)[field] = value;
    setLocal(next);
  };

  const saveRow = async (row: PlanItem) => {
    const { error } = await supabase
      .from('weekly_plan')
      .update({
        target_sets: row.target_sets,
        target_reps: row.target_reps,
        target_weight: row.target_weight,
      })
      .eq('id', row.id);

    if (error) {
      console.error('save weekly_plan error:', error);
      return;
    }
    onSaved();
  };

  return (
    <div style={{ background: '#fff', padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>
        {DAY_LABELS[dayOfWeek]}
      </div>

      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        {dayTitle}
      </div>

      {dayNotes && (
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
          {dayNotes}
        </div>
      )}

      {local.length === 0 && (
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          No plan items for this day.
        </div>
      )}

      {local.map((row, idx) => (
        <div key={row.id} style={{ borderTop: '1px solid #eee', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ fontWeight: 600 }}>{row.exercises?.name ?? `Exercise ${row.exercise_id}`}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 6 }}>
            <label style={{ fontSize: 12 }}>
              Sets
              <input
                type="number"
                value={row.target_sets}
                onChange={(e) => updateField(idx, 'target_sets', Number(e.target.value))}
                onBlur={() => saveRow(local[idx])}
                style={{ width: '100%' }}
              />
            </label>

            <label style={{ fontSize: 12 }}>
              Reps
              <input
                type="number"
                value={row.target_reps}
                onChange={(e) => updateField(idx, 'target_reps', Number(e.target.value))}
                onBlur={() => saveRow(local[idx])}
                style={{ width: '100%' }}
              />
            </label>

            <label style={{ fontSize: 12 }}>
              Weight (lb)
              <input
                type="number"
                value={row.target_weight ?? ''}
                onChange={(e) => updateField(idx, 'target_weight', e.target.value === '' ? null : Number(e.target.value))}
                onBlur={() => saveRow(local[idx])}
                style={{ width: '100%' }}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
