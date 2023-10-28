import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEffect } from "react";
import { api } from "~/utils/api";

export const DocumentsPage = withAuth(() => {
  const router = useRouter();

  const { data, isLoading } = api.user.getSessionInfo.useQuery();

  useEffect(() => {
    if (
      !isLoading &&
      data?.session?.workspace_id !==
        router.asPath.replace("/", "").replace("/documents", "")
    )
      void (async function (workspaceId: string, sessionId: string) {
        await axios.post("/api/auth/update-session", {
          sessionId,
          workspaceId,
        });
        await router.push("/" + workspaceId + "/documents");
        router.reload();
      })(
        router.asPath.replace("/", "").replace("/documents", ""),
        data!.session!.id,
      );
  }, [data, router, isLoading]);

  return (
    <>
      <Head>
        <title>Chiral</title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        <main className="flex min-h-screen w-full flex-col items-center justify-center p-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl font-bold">
              Automate your product backlogs
            </h1>

            <p className="text-bold my-6 max-w-xl text-lg text-slate-200 md:text-xl">
              Generate <span className="font-bold text-primary">clear</span> and{" "}
              <span className="font-bold text-primary">actionable</span> tickets
              from your PRDs and maximize your team&apos;s productivity with
              Chiral.
            </p>
          </div>
        </main>
      </DashboardLayout>
    </>
  );
});
