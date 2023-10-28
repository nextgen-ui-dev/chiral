import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingHero } from "~/layouts/LoadingHero";

export const DocumentsPage = withAuth(() => {
  const router = useRouter();

  const { data, isLoading } = api.user.getSessionInfo.useQuery();
  const { data: documentsData, isLoading: documentsLoading } =
    api.workspace.linear.getDocuments.useQuery();

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
        {documentsLoading ? (
          <LoadingHero />
        ) : (
          <main className="flex min-h-screen w-full flex-col p-8">
            <h1 className="text-4xl font-bold">Documents</h1>
            <ul className="my-4 overflow-y-auto">
              {documentsData?.documents.map((document) => {
                return (
                  <li
                    key={document.id}
                    className="flex flex-row items-center justify-between"
                  >
                    <p>{document.title}</p>
                    <p>{document.project?.name}</p>
                  </li>
                );
              })}
            </ul>
          </main>
        )}
      </DashboardLayout>
    </>
  );
});
