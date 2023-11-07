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

import { Icon } from "@iconify/react";
import { TeamSelectionCombobox } from "./TeamSelectionCombobox";

interface GeneratedIssuesPageProps {
  docId: string;
  handleSelectTeam: (id: string) => void;
  exportLinearDriver: (issues: IssueData[]) => void;
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
  docId: documentId,
  handleSelectTeam,
  exportLinearDriver
}) => {
  // const { data: sessionData, isLoading: sessionLoading } =
    // api.user.getSessionInfo.useQuery();

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
            <div>
              <div className="flex items-center gap-x-4">
                {/* Select team + Export to linear */}
                <TeamSelectionCombobox 
                  handleSelectTeam={handleSelectTeam}
                />
                <div
                  className="flex items-center gap-x-2  text-white min-w-[50px] bg-white bg-opacity-30 border border-primary-500 p-2 text-lg rounded-lg hover:cursor-pointer"
                  onClick={() => exportLinearDriver(generatedIssues)}
                >
                  <Icon icon="mingcute:linear-fill" fontSize={20} />
                  Export to Linear
                </div>
              </div>
              <IssuesList issues={generatedIssues ?? []} />
            </div>
          ) : (
            <div className="flex flex-row items-center text-xl">
              There seems to be a problem while displaying your issues
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneratedIssuesPage;
