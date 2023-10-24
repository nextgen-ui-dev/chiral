import { Icon } from "@iconify/react";
import Head from "next/head";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <>
      <Head>
        <title>Chiral</title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen w-screen flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl font-bold">Automate your product backlogs</h1>

          <p className="text-bold my-6 max-w-xl text-lg text-slate-200 md:text-xl">
            Chiral generates{" "}
            <span className="text-primary font-bold">clear</span> and{" "}
            <span className="text-primary font-bold">actionable</span> tickets
            from your PRDs and maximize your team&apos;s productivity.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Button className="bg-primary-dark flex flex-row place-content-center gap-2 px-10 py-7 text-base">
              <Icon icon="mingcute:linear-fill" fontSize={24} />
              Sign in with Linear
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
