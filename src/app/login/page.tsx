import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(47,111,118,0.16),_rgba(247,241,232,1)_55%)] px-6 py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center">
        <AuthForm />
      </div>
    </main>
  );
}
