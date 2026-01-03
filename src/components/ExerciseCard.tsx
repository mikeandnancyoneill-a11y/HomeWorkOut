import SetRow from './SetRow';
import PainToggle from './PainToggle';

export default function ExerciseCard({ name }: { name: string }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <SetRow />
      <SetRow />
      <SetRow />
      <PainToggle />
    </div>
  );
}
