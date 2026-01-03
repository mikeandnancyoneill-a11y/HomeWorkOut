import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import WeeklyPlanner from "./pages/WeeklyPlanner";
import Auth from "./pages/Auth";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: "1rem" }}>Loading...</div>;

  return session ? <WeeklyPlanner /> : <Auth />;
}
