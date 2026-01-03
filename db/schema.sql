create table exercises (
  id serial primary key,
  name text not null,
  type text,
  equipment text,
  shoulder_safe boolean default false
);

create table workout_logs (
  id serial primary key,
  user_id uuid references auth.users(id),
  workout_date date,
  exercise_id int references exercises(id),
  set_number int,
  reps int,
  weight_lb numeric,
  rpe int,
  pain boolean default false,
  notes text,
  created_at timestamp default now()
);

create table body_metrics (
  id serial primary key,
  user_id uuid references auth.users(id),
  metric_date date,
  weight_lb numeric,
  waist_in numeric
);
