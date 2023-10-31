import React, { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { api } from '~/utils/api';
import { withAuth } from '~/components/withAuth';
import { DashboardLayout } from '~/layouts/DashboardLayout';
import { LoadingHero } from '~/layouts/LoadingHero';
import IssuesList from './IssuesList';
import { Issue } from '@linear/sdk';


const IssueGeneratorPage = withAuth(() => {
  const router = useRouter();

  const { data: sessionData, isLoading: sessionLoading } = 
    api.user.getSessionInfo.useQuery();

  const { data: GeneratedIssuesData, isLoading: generatedIssuesLoading } = 
    api.workspace.linear.getGeneratedIssues.useQuery();

  useEffect(() => {
    if (
      !sessionLoading && 
      sessionData?.session?.workspace_id !== 
      router.asPath.replace("/", "").replace("/generate", "")) {
      // If the session has changed...
      void(async function (workspaceId: string, sessionId: string) {
        await axios.post("/api/auth/update-session", {
          sessionId, 
          workspaceId
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
        <title>Chiral</title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        {generatedIssuesLoading ? (
          <LoadingHero />
        ) : (
          <main className="flex min-h-screen w-full flex-col p-8">
            <h1 className="text-4xl font-bold">Generated Issues</h1>

            {GeneratedIssuesData ?
              <IssuesList issues={GeneratedIssuesData?.issues ?? []}  /> 
              : (
                <div>
                  There seems to be a problem while displaying your issues
                </div>
              )}
          </main>
        )}
      </DashboardLayout>
    </>
  )
});

export default IssueGeneratorPage;
