import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingHero } from "~/layouts/LoadingHero";
import { MarkdownDocumentView } from "./components/MarkdownDocumentView";
import { DocumentChat } from "./components/DocumentChat";

export const DocumentDetailPage = withAuth(() => {
  const router = useRouter();
  const documentId = router.asPath
    .replace("/", "")
    .replace("/documents", "")
    .split("/")[1]!;

  const { data, isLoading } = api.user.getSessionInfo.useQuery();
  const {
    data: documentData,
    isLoading: documentLoading,
    error,
  } = api.workspace.linear.getDocumentDetail.useQuery({ documentId });

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
        <title>
          {!documentLoading && error === null
            ? documentData?.title + " | "
            : ""}
          Chiral
        </title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        {documentLoading ? (
          <LoadingHero />
        ) : error !== null ? (
          <main className="flex min-h-screen w-full flex-col p-8">
            <h1 className="text-4xl font-bold">{error.message}</h1>
          </main>
        ) : (
          <main className="flex min-h-screen w-full flex-row">
            <div className="flex h-screen w-full flex-col">
              <MarkdownDocumentView markdown={documentData?.content} />
            </div>
            <div className="flex min-h-screen min-w-[28rem] max-w-md border-l-2 border-primary-darker">
              <DocumentChat document={documentData} />
            </div>
          </main>
        )}
      </DashboardLayout>
    </>
  );
});
