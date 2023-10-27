import Head from "next/head";
import Image from "next/image";

export const LoadingHero = () => (
  <>
    <Head>
      <title>Chiral</title>
      <meta name="description" content="Automate your product backlogs" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-8">
      <div className="flex animate-pulse flex-col items-center text-center">
        <Image src="/favicon.ico" alt="Chiral Icon" width={60} height={60} />
        <p className="mt-4 text-xl text-slate-300">Loading...</p>
      </div>
    </main>
  </>
);
