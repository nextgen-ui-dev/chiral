import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEffect } from "react";
import { api } from "~/utils/api";

export const DocumentDetailPage = withAuth(() => {
  const router = useRouter();

  const { data, isLoading } = api.user.getSessionInfo.useQuery();

  useEffect(() => {
    const [workspaceId, documentId] = router.asPath
      .replace("/", "")
      .replace("/documents", "")
      .split("/");
    if (!isLoading && data?.session?.workspace_id !== workspaceId)
      void (async function (workspaceId: string, sessionId: string) {
        await axios.post("/api/auth/update-session", {
          sessionId,
          workspaceId,
        });
        await router.push("/" + workspaceId + "/documents/" + documentId);
        router.reload();
      })(workspaceId!, data!.session!.id);
  }, [data, router, isLoading]);

  return (
    <>
      <Head>
        <title>Chiral</title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        <main className="flex min-h-screen w-full flex-col p-8">
          <h1 className="text-4xl font-bold">Document Detail</h1>
        </main>
      </DashboardLayout>
    </>
  );
});
