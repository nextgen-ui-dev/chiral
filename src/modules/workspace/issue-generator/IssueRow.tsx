import React from "react";
import { Issue, User, Project } from "@linear/sdk";
import { stringify } from "querystring";

type IssueData = Pick<Issue, "id" | "title"> & {
  creator: User | undefined;
  project: Project | undefined;
}

type IssueRowProps = {
  issues: IssueData[] | undefined;
};

const IssueRow: React.FC<IssueRowProps> = ({
  issues
}) => {
  console.log("Issues", issues);
  return (
    <div>
      {issues?.map(issue => {
        return (
          <div key={issue.id}>
            {issue.title}
          </div>
        );
      })}
    </div>
  );
};

export default IssueRow;