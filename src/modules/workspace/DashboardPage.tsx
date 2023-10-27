import { LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DashboardLayout } from "~/layouts/DashboardLayout";

export const DashboardPage = () => (
  <DashboardLayout>
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-5xl font-bold">Automate your product backlogs</h1>

        <p className="text-bold my-6 max-w-xl text-lg text-slate-200 md:text-xl">
          Generate <span className="font-bold text-primary">clear</span> and{" "}
          <span className="font-bold text-primary">actionable</span> tickets
          from your PRDs and maximize your team&apos;s productivity with Chiral.
        </p>

        <form
          className="flex flex-col items-center gap-4"
          method="POST"
          action="/api/auth/logout"
        >
          <Button
            className="flex flex-row place-content-center gap-2 bg-primary-dark px-10 py-7 text-base"
            type="submit"
          >
            <LogOut size={24} />
            Sign Out
          </Button>
        </form>
      </div>
    </main>
  </DashboardLayout>
);
