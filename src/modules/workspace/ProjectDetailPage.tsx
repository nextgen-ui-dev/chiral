import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingHero } from "~/layouts/LoadingHero";

export const ProjectDetailPage = withAuth(() => {
    const router = useRouter();
    const projectId = router.asPath
        .replace("/", "")
        .replace("/projects", "")
        .split("/")[1]!;

    const { data, isLoading } = api.user.getSessionInfo.useQuery();
    const {
        data: documentData,
        isLoading: documentLoading,
        error,
    } = api.workspace.linear.getProjectDetail.useQuery({ projectId });

    useEffect(() => {
        const [workspaceId, documentId] = router.asPath
            .replace("/", "")
            .replace("/projects", "")
            .split("/");
        if (!isLoading && data?.session?.workspace_id !== workspaceId)
            void (async function (workspaceId: string, sessionId: string) {
                await axios.post("/api/auth/update-session", {
                    sessionId,
                    workspaceId,
                });
                await router.push("/" + workspaceId + "/projects/" + documentId);
                router.reload();
            })(workspaceId!, data!.session!.id);
    }, [data, router, isLoading]);

    return (
        <>
            <Head>
                <title>
                    {!documentLoading && error === null
                        ? documentData?.name + " | "
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

                    </main>
                )}
            </DashboardLayout>
        </>
    );
});
