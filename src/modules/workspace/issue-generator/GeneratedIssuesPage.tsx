/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";

import { api } from "~/utils/api";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { LoadingHero } from "~/layouts/LoadingHero";
import { IssuesList, type IssueData } from "./IssuesList";

interface GeneratedIssuesPageProps {
  handleGenerate: (newValue: boolean) => void;
}

const jsonToObjArray = (j: JSON): IssueData[] => {
  const res_array: IssueData[] = [];

  for (const key in j) {
    // Grab suggestion JSON
    const suggestion: IssueData = j[key as keyof unknown];

    // Append with ID
    res_array.push({
      ...suggestion,
      id: parseInt(key)
    });
  }

  return res_array;
}

const GeneratedIssuesPage: React.FC<GeneratedIssuesPageProps> = ({
  handleGenerate
}) => {
  const router = useRouter();

  // const { data: sessionData, isLoading: sessionLoading } =
    api.user.getSessionInfo.useQuery();

  const documentId = "5c4c13b4-1474-4744-ab57-2557cf48668f";

  const { data: GeneratedIssuesData, isLoading: generatedIssuesLoading } =
    api.workspace.issue.generateIssueRecommendations.useQuery({
      providerDocumentId: documentId
    }, {
      refetchOnWindowFocus: false,
    });
  
  let generatedIssues: IssueData[] = [];
  if (GeneratedIssuesData) {
    generatedIssues = jsonToObjArray(GeneratedIssuesData);


    console.log("generatedIssues", generatedIssues);
  }

  return (
    <div>
      {generatedIssuesLoading ? (
        <LoadingHero />
      ) : (
        <div>
          {GeneratedIssuesData ? (
            <IssuesList issues={generatedIssues ?? []} />
          ) : (
            <div>
              There seems to be a problem while displaying your issues
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneratedIssuesPage;
