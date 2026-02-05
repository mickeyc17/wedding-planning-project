"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AuthForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const authResponse = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    setLoading(false);

    if (authResponse.error) {
      setError(authResponse.error.message);
      return;
    }

    setMessage("Check your email for the magic link to sign in.");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white/80 p-8 shadow-panel">
      <h1 className="text-2xl font-semibold">Wedding Project Tracker</h1>
      <p className="mt-2 text-sm text-ink/70">
        Invite-only access. Sign in with your approved email to continue.
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </label>
        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60"
        >
          {loading ? "Sending link..." : "Send magic link"}
        </button>
      </form>
      <p className="mt-4 text-xs text-ink/70">
        We will email you a secure sign-in link. No passwords needed.
      </p>
    </div>
  );
}
