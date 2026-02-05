import AuthGate from "@/components/AuthGate";
import BoardApp from "@/components/BoardApp";
import SignOutButton from "@/components/SignOutButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(29,143,151,0.18),_rgba(241,251,251,1)_55%)] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex justify-end">
          <SignOutButton />
        </div>
        <AuthGate>
          <BoardApp />
        </AuthGate>
      </div>
    </main>
  );
}
