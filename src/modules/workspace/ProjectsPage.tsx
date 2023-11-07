import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingHero } from "~/layouts/LoadingHero";
import { ProjectsDataTable } from "./components/ProjectsDataTable";

export const ProjectsPage = withAuth(() => {
    const router = useRouter();
  
    const { data, isLoading } = api.user.getSessionInfo.useQuery();
    const { data: documentsData, isLoading: documentsLoading } =
      api.workspace.linear.getProjects.useQuery();
  
    useEffect(() => {
      if (
        !isLoading &&
        data?.session?.workspace_id !==
          router.asPath.replace("/", "").replace("/projects", "")
      )
        void (async function (workspaceId: string, sessionId: string) {
          await axios.post("/api/auth/update-session", {
            sessionId,
            workspaceId,
          });
          await router.push("/" + workspaceId + "/projects");
          router.reload();
        })(
          router.asPath.replace("/", "").replace("/projects", ""),
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
              <h1 className="text-4xl font-bold">Projects</h1>
              <ProjectsDataTable projects={documentsData?.projects ?? []} />
            </main>
          )}
        </DashboardLayout>
      </>
    );
  });
  