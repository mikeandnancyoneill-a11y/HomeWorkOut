import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [status, setStatus] = useState<string>("");

  const signInMagic = async () => {
    setStatus("Sending magic link...");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Netlify domain callback URL (adjust if you use a different one)
        emailRedirectTo: window.location.origin,
      },
    });
    setStatus(error ? `Error: ${error.message}` : "Magic link sent. Check your email.");
  };

  const signUpPassword = async () => {
    setStatus("Creating account...");
    const { error } = await supabase.auth.signUp({ email, password });
    setStatus(error ? `Error: ${error.message}` : "Account created. Now sign in.");
  };

  const signInPassword = async () => {
    setStatus("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setStatus(error ? `Error: ${error.message}` : "Signed in.");
  };

  return (
    <div style={{ maxWidth: 420, margin: "3rem auto", background: "#fff", padding: "1rem", borderRadius: 8, border: "1px solid #ddd" }}>
      <h2>HomeWorkOut Login</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setMode("magic")} style={{ flex: 1 }}>
          Magic Link
        </button>
        <button onClick={() => setMode("password")} style={{ flex: 1 }}>
          Password
        </button>
      </div>

      <label style={{ display: "block", marginBottom: 8 }}>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
      </label>

      {mode === "password" && (
        <label style={{ display: "block", marginBottom: 8 }}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />
        </label>
      )}

      {mode === "magic" ? (
        <button onClick={signInMagic} style={{ width: "100%", marginTop: 8 }}>
          Send Magic Link
        </button>
      ) : (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={signInPassword} style={{ flex: 1 }}>
            Sign In
          </button>
          <button onClick={signUpPassword} style={{ flex: 1 }}>
            Sign Up
          </button>
        </div>
      )}

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}
