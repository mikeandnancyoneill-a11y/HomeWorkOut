import { format } from 'date-fns';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

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

export default function WeeklyDayColumn({
  date,
  exercises,
  userId,
  refreshWeek,
}: {
  date: Date;
  exercises: ExerciseLog[];
  userId: string | null;
  refreshWeek: () => void;
}) {
  const [logs, setLogs] = useState<ExerciseLog[]>(exercises);

  const handleChange = (index: number, field: 'reps' | 'weight_lb' | 'rpe' | 'pain', value: any) => {
    const newLogs = [...logs];
    newLogs[index] = { ...newLogs[index], [field]: value };
    setLogs(newLogs);
  };

  const saveLog = async (log: ExerciseLog) => {
    if (!userId) return;
    await supabase.from('workout_logs').upsert({
      id: log.id,
      user_id: userId,
      workout_date: log.workout_date,
      exercise_id: log.exercise_id,
      set_number: log.set_number,
      reps: log.reps,
      weight_lb: log.weight_lb,
      rpe: log.rpe,
      pain: log.pain,
    });
    refreshWeek();
  };

  return (
    <div style={{ flex: 1, border: '1px solid #ccc', padding: '0.5rem', borderRadius: '6px' }}>
      <h3>{format(date, 'EEE dd/MM')}</h3>
      {logs.map((log, idx) => (
        <div key={idx} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
          <strong>{log.exercise_name}</strong>
          <div>
            Reps:{' '}
            <input
              type="number"
              value={log.reps}
              onChange={(e) => handleChange(idx, 'reps', Number(e.target.value))}
            />
            Weight:{' '}
            <input
              type="number"
              value={log.weight_lb}
              onChange={(e) => handleChange(idx, 'weight_lb', Number(e.target.value))}
            />
            RPE:{' '}
            <input
              type="number"
              value={log.rpe || ''}
              onChange={(e) => handleChange(idx, 'rpe', Number(e.target.value))}
            />
            Pain:{' '}
            <input
              type="checkbox"
              checked={log.pain || false}
              onChange={(e) => handleChange(idx, 'pain', e.target.checked)}
            />
            <button onClick={() => saveLog(log)}>Save</button>
          </div>
        </div>
      ))}
    </div>
  );
}
