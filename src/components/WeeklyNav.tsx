import { format } from 'date-fns';

export default function WeeklyNav({
  onWeekChange,
  currentWeekStart,
}: {
  onWeekChange: (weeks: number) => void;
  currentWeekStart: Date;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <button onClick={() => onWeekChange(-1)}>Previous Week</button>
      <span>
        Week of {format(currentWeekStart, 'dd/MM/yyyy')}
      </span>
      <button onClick={() => onWeekChange(1)}>Next Week</button>
    </div>
  );
}
