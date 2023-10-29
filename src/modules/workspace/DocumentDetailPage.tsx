import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingHero } from "~/layouts/LoadingHero";
import { File } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

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
                <div className="min-h-[calc(100vh-5rem)] w-full overflow-y-auto py-4">
                  <div className="flex flex-row items-end gap-3">
                    <Avatar className="h-8 w-8 bg-white p-[0.5px]">
                      <AvatarImage src="/favicon.ico" alt="Chiral AI Icon" />
                      <AvatarFallback>CH</AvatarFallback>
                    </Avatar>
                    <div className="relative max-w-full rounded-lg bg-primary p-2 text-sm">
                      <p>
                        Greetings! My name is Chiral and I&apos;m here to help
                        answer questions regarding your document.
                      </p>
                      <div className="absolute -bottom-[3px] -left-[5px] h-0 w-0 -rotate-[30deg] border-b-[5px] border-r-[10px] border-t-[5px] border-primary border-b-transparent border-t-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </DashboardLayout>
    </>
  );
});
