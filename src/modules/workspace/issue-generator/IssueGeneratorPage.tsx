import Head from 'next/head';
import React from 'react';
import { withAuth } from '~/components/withAuth';
import { DashboardLayout } from '~/layouts/DashboardLayout';
import { LoadingHero } from '~/layouts/LoadingHero';

const IssueGeneratorPage = withAuth(() => {
  // DUMMY STATE
  const generatedIssuesLoading = false;

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
          </main>
        )}
      </DashboardLayout>
    </>
  )
});

export default IssueGeneratorPage;
