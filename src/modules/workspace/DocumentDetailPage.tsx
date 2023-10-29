import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingHero } from "~/layouts/LoadingHero";
import { File } from "lucide-react";
import { SystemChat } from "./components/SystemChat";
import { UserChat } from "./components/UserChat";

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

  console.log(documentData);

  return (
    <>
      <Head>
        <title>Chiral</title>
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
            <div className="flex min-h-screen w-full flex-col"></div>
            <div className="border-primary-darker flex min-h-screen min-w-[28rem] max-w-md border-l">
              <div className="bg-primary-darker flex h-20 w-full flex-col gap-2 px-2 py-3">
                <div className="flex w-full flex-row items-center gap-1">
                  <File className="h-6 w-6" />
                  <h1 className="text-xl font-medium">
                    {documentData?.title.length > 38
                      ? documentData?.title.substring(0, 38) + "..."
                      : documentData?.title}
                  </h1>
                </div>
                <div className="flex w-full flex-row items-center gap-2">
                  <p className="text-sm text-slate-300">Project:</p>
                  <p className="text-sm">{documentData?.project?.name}</p>
                </div>
                <div className="flex min-h-[calc(100vh-5rem)] w-full flex-col gap-y-5 overflow-y-auto py-6">
                  <SystemChat text="Greetings! My name is Chiral and I'm here to help answer questions regarding your document." />
                  <UserChat text="Hi! What's the purpose of this product?" />
                </div>
              </div>
            </div>
          </main>
        )}
      </DashboardLayout>
    </>
  );
});
