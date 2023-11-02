import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
import { DashboardLayout } from "~/layouts/DashboardLayout";

const IssueDetailPage = () => {
  const router = useRouter();
  const issueId = router.asPath
    .replace("/", "")
    .replace("/generate", "")
    .split("/")[1]!;

  const { data: sessionData, isLoading: sessionIsLoading } = 
    api.user.getSessionInfo.useQuery();
  
  const { data: IssueDetailData, isLoading: issueIsLoading, error } = 
    api.workspace.linear.getIssueById.useQuery({
      issueId
    }, {
      refetchOnWindowFocus: false
    });

  useEffect(() => {
    const [workspaceId, issueId] = router.asPath
      .replace("/", "")
      .replace("/generate", "")
      .split("/");

      if (!sessionIsLoading && sessionData?.session?.workspace_id !== workspaceId)
      void (async function (workspaceId: string, sessionId: string) {
        await axios.post("/api/auth/update-session", {
          sessionId,
          workspaceId,
        });
        await router.push("/" + workspaceId + "/generate/" + issueId);
        router.reload();
      })(workspaceId!, sessionData!.session!.id);
  }, [sessionData, router, sessionIsLoading]);
  
  return (
    <>
      <Head>
        <title>
          {!issueIsLoading && error === null
            ? IssueDetailData?.title + " | "
            : ""}
          Chiral
        </title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        <div className={`flex flex-row h-screen w-full divide-x`}>
          {/* Main Editor Space */}
          <div className={`flex flex-col w-full`}>
            <div>
              {/* Issue Title */}
              {IssueDetailData?.title}
            </div>
            <div>
              {/* Issue Description */}
              {IssueDetailData?.description}
            </div>
          </div>

          {/* Sidebar Space */}
          <div className={`flex flex-col w-[300px] bg-opacity-50`}>
            
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default IssueDetailPage;