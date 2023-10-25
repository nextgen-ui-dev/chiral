import { Loader2 } from "lucide-react";

export const LoadingHero = () => (
  <main className="flex min-h-screen w-full flex-col items-center justify-center p-8">
    <div className="flex animate-pulse flex-col items-center text-center">
      <Loader2 className="animate-spin font-bold text-primary" size={40} />
      <p className="mt-4 text-xl text-slate-300">Loading...</p>
    </div>
  </main>
);
