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

import { type IssueData } from "./IssuesList";

const IssueGeneratorDashboard = withAuth(() => {
  const [generated, setGenerated] = useState<boolean>(false);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const { mutate } = api.workspace.issue.exportGeneratedIssue.useMutation();

  const handleGenerate = (val: boolean, docId: string) => {
    setGenerated(val);
    setSelectedDocId(docId);
  };

  const handleSelectTeam = (id: string) => {
    setSelectedTeamId(id);
  };

  const handleExportLinear = (teamId: string, issue: IssueData) => {
    mutate({
      teamId: teamId,
      issue: {
        title: issue.title,
        description: issue.description,
        priority: issue.priority
      }
    });
  };

  const exportLinearDriver = (issues: IssueData[]) => {
    if (selectedTeamId === "" 
        || issues === undefined 
        || issues.length === 0) {
          console.log("exportLinearDriver failed to execute");
          return;
        }

    const recommendations: IssueData[] = issues;
    console.log("exportLinearDriver.reccomendations", recommendations);
    recommendations.map((recs) => {
      console.log(`Exporting issue: ${recs.title}`);
      handleExportLinear(selectedTeamId, recs);
    });
  }
  
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
            </div>
              <GeneratedIssuesPage
                docId={selectedDocId}
                handleSelectTeam={handleSelectTeam}
                exportLinearDriver={exportLinearDriver}
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
