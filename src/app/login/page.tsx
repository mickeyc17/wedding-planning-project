import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(29,143,151,0.18),_rgba(241,251,251,1)_55%)] px-6 py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center">
        <AuthForm />
      </div>
    </main>
  );
}
