import React, { useState, useEffect } from "react";
import { withAuth } from "~/components/withAuth";


import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

import GeneratedIssuesPage from "./GeneratedIssuesPage";
import { IssueDocumentDataTable } from "~/modules/workspace/issue-generator/IssueDocumentDataTable";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { LoadingHero } from "~/layouts/LoadingHero";
import { Icon } from "@iconify/react";
import { TeamSelectionCombobox } from "./TeamSelectionCombobox";

const IssueGeneratorDashboard = withAuth(() => {
  const [generated, setGenerated] = useState<boolean>(false);

  const handleGenerate = (val: boolean) => {
    setGenerated(val);
  };
  
  const router = useRouter();

  const { data: sessionData, isLoading: sessionLoading } =
    api.user.getSessionInfo.useQuery();
  
  const { data: documentsData, isLoading: documentsLoading } =
    api.workspace.linear.getDocuments.useQuery();


  useEffect(() => {
    if (
      !sessionLoading &&
      sessionData?.session?.workspace_id !==
        router.asPath.replace("/", "").replace("/generate", "")
    ) {
      // If the session has changed...
      void (async function (workspaceId: string, sessionId: string) {
        await axios.post("/api/auth/update-session", {
          sessionId,
          workspaceId,
        });

        await router.push("/" + workspaceId + "/generate");
        router.reload();
      })(
        router.asPath.replace("/", "").replace("/generate", ""),
        sessionData!.session!.id,
      );
    }
  }, [sessionData, router, sessionLoading]);

  return (
    <>
      <Head>
      <title>Issue Generator</title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        { documentsLoading ? (
          <LoadingHero />
        ) : generated ? (
          <main className="flex min-h-screen w-full flex-col p-8">
            <div className={`flex flex-row justify-between pb-6`}>
              <h1 className="text-3xl font-bold">Issue Recommendations</h1>
              <div className="flex items-center gap-x-4">
                {/* Select team + Export to linear */}
                <TeamSelectionCombobox />
                <div
                  className="flex items-center gap-x-2  text-white min-w-[60px] bg-white bg-opacity-30 border border-primary-500 p-2 text-lg rounded-lg hover:cursor-pointer"
                  onClick={() => {
                    handleGenerate(false)
                  }}
                >
                  <Icon icon="mingcute:linear-fill" fontSize={20} />
                  Export to Linear
                </div>
              </div>
            </div>
              <GeneratedIssuesPage
                handleGenerate={handleGenerate}
              />
          </main>
        ) : (
          <main className="flex min-h-screen w-full flex-col p-8">
            <h1 className="text-3xl font-bold">Generate Issues from Documents</h1>
            <IssueDocumentDataTable 
              handleGenerate={handleGenerate}
              documents={documentsData?.documents ?? []} 
            />
          </main>
        )}
      </DashboardLayout>
    </>
  );
});

export default IssueGeneratorDashboard;
