"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.push("/login");
        return;
      }

      setReady(true);
    };

    check();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  if (!ready) {
    return (
      <div className="rounded-2xl bg-white/80 p-6 text-sm text-ink/70 shadow-panel">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}
