import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PlanItem } from '../pages/WeeklyPlanner';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COLORS = {
  supersetBg: '#d9f7d9',      // green
  supersetBorder: '#2e7d32',  // darker green border
  regularBg: '#eefbea',       // light green
  regularBorder: '#cfe8cf',
  optionalBg: '#eeeeee',      // gray
  optionalBorder: '#bdbdbd',
};

function sortKey(a: PlanItem) {
  const g = a.superset_group ?? 9999;
  const o = a.superset_order ?? 9999;
  // Optional items should sort after non-optional items
  const opt = a.is_optional ? 1 : 0;
  return g * 100000 + o * 10 + opt;
}

function youtubeSearchUrl(query: string) {
  const q = encodeURIComponent(`${query} proper form tutorial`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

export default function WeeklyDayColumn({
  dayOfWeek,
  weekStart, // unused here but kept consistent with parent props
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

  const sorted = useMemo(() => [...local].sort((a, b) => sortKey(a) - sortKey(b)), [local]);

  const grouped = useMemo(() => {
    const groups: Array<{ key: string; supersetGroup: number | null; rows: PlanItem[] }> = [];
    const singles: PlanItem[] = [];

    const map = new Map<number, PlanItem[]>();
    sorted.forEach((r) => {
      if (r.superset_group == null) singles.push(r);
      else map.set(r.superset_group, [...(map.get(r.superset_group) ?? []), r]);
    });

    [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .forEach(([g, rows]) => {
        groups.push({
          key: `ss-${g}`,
          supersetGroup: g,
          rows: rows.sort((a, b) => (a.superset_order ?? 0) - (b.superset_order ?? 0)),
        });
      });

    // Put singles after supersets; optional singles naturally appear last due to sortKey
    singles.forEach((r) => groups.push({ key: `single-${r.id}`, supersetGroup: null, rows: [r] }));

    return groups;
  }, [sorted]);

  const updateField = (id: string, patch: Partial<PlanItem>) => {
    setLocal((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const saveRow = async (row: PlanItem) => {
    const payload: any = {
      actual_sets: row.actual_sets,
      actual_reps: row.actual_reps,
      actual_weight: row.actual_weight,
      completed: row.completed,
    };

    // planned edits only if not locked (DB trigger also enforces)
    if (!row.locked_at) {
      payload.target_sets = row.target_sets;
      payload.target_reps = row.target_reps;
      payload.target_weight = row.target_weight;
    }

    const { error } = await supabase.from('weekly_plan').update(payload).eq('id', row.id);
    if (error) {
      console.error('save weekly_plan error:', error);
      alert(error.message);
      return;
    }
    onSaved();
  };

  const toggleDone = async (row: PlanItem, checked: boolean) => {
    const next: PlanItem = {
      ...row,
      completed: checked,
      actual_sets: checked ? (row.actual_sets ?? row.target_sets) : row.actual_sets,
      actual_reps: checked ? (row.actual_reps ?? row.target_reps) : row.actual_reps,
      actual_weight: checked ? (row.actual_weight ?? row.target_weight) : row.actual_weight,
    };
    updateField(row.id, next);
    await saveRow(next);
  };

  return (
    <div style={{ background: '#fff', padding: '0.75rem', borderRadius: 10, border: '1px solid #ddd' }}>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>{DAY_LABELS[dayOfWeek]}</div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{dayTitle}</div>
      {dayNotes && <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10 }}>{dayNotes}</div>}

      {grouped.length === 0 && <div style={{ fontSize: 12, opacity: 0.7 }}>No plan items for this day.</div>}

      {grouped.map((g) => {
        const isSuperset = g.supersetGroup != null;

        return (
          <div
            key={g.key}
            style={{
              border: isSuperset ? `2px solid ${COLORS.supersetBorder}` : '1px solid #eee',
              borderRadius: 10,
              padding: '0.6rem',
              marginTop: '0.6rem',
              background: isSuperset ? COLORS.supersetBg : '#fff',
            }}
          >
            {isSuperset && (
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                Superset {g.supersetGroup}
              </div>
            )}

            {g.rows.map((row) => {
              const locked = !!row.locked_at;
              const exName = row.exercises?.name ?? `Exercise ${row.exercise_id}`;

              const videoUrl = row.exercises?.video_url || youtubeSearchUrl(exName);

              const tips = row.exercises?.coaching_tips ?? '';
              const planNote = row.notes ?? '';
              const tooltip = [tips, planNote].filter(Boolean).join(' | ');

              const rowBg = row.is_optional ? COLORS.optionalBg : COLORS.regularBg;
              const rowBorder = row.is_optional ? COLORS.optionalBorder : COLORS.regularBorder;

              return (
                <div
                  key={row.id}
                  style={{
                    padding: '10px',
                    marginTop: '10px',
                    borderRadius: 10,
                    background: rowBg,
                    border: `1px solid ${rowBorder}`,
                    opacity: row.completed ? 0.92 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={tooltip || undefined}
                        style={{ fontWeight: 750, textDecoration: 'underline', color: '#1b5e20' }}
                      >
                        {exName}
                      </a>

                      {row.is_optional && (
                        <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.8, marginTop: 3 }}>
                          OPTIONAL (do if time/energy)
                        </div>
                      )}

                      {row.notes && (
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                          {row.notes}
                        </div>
                      )}
                    </div>

                    <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={row.completed}
                        onChange={(e) => toggleDone(row, e.target.checked)}
                      />
                      Done {locked ? '(Locked)' : ''}
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                      <div style={{ fontWeight: 800, marginBottom: 2 }}>Planned</div>
                      <div>
                        {row.target_sets} x {row.target_reps} @ {row.target_weight ?? '—'} lb
                      </div>
                    </div>

                    <label style={{ fontSize: 12 }}>
                      Actual Sets
                      <input
                        type="number"
                        value={row.actual_sets ?? ''}
                        disabled={locked}
                        onChange={(e) => updateField(row.id, { actual_sets: e.target.value === '' ? null : Number(e.target.value) })}
                        onBlur={() => saveRow(local.find((x) => x.id === row.id) ?? row)}
                        style={{ width: '100%' }}
                      />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <label style={{ fontSize: 12 }}>
                        Actual Reps / Min / m
                        <input
                          type="number"
                          value={row.actual_reps ?? ''}
                          disabled={locked}
                          onChange={(e) => updateField(row.id, { actual_reps: e.target.value === '' ? null : Number(e.target.value) })}
                          onBlur={() => saveRow(local.find((x) => x.id === row.id) ?? row)}
                          style={{ width: '100%' }}
                        />
                      </label>

                      <label style={{ fontSize: 12 }}>
                        Actual Weight (lb)
                        <input
                          type="number"
                          value={row.actual_weight ?? ''}
                          disabled={locked}
                          onChange={(e) => updateField(row.id, { actual_weight: e.target.value === '' ? null : Number(e.target.value) })}
                          onBlur={() => saveRow(local.find((x) => x.id === row.id) ?? row)}
                          style={{ width: '100%' }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
