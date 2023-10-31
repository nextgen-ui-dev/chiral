import React from "react";
import { Issue, User, Project } from "@linear/sdk";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";


type IssueData = Issue & {
  creator: User | undefined;
  project: Project | undefined;
}

type IssuesListProps = {
  issues: IssueData[] | undefined;
};

const IssuesList: React.FC<IssuesListProps> = ({
  issues
}) => {
  console.log("Issues", issues);
  return (
    <div>
      {issues?.map(issue => {
        return (
          <div 
            key={issue.id}
            className={"w-full flex flex-row bg-gray-500 bg-opacity-50 text-white font-semibold justify-between"}
          >
            <div className="flex flex-row">
              {issue.priority}
              {issue.title}
            </div>
            <div className="flex flex-row">
              {issue.project?.name}
              {issue.dueDate as string}
              {/* {new Date(issue.dueDate as string).toLocaleDateString()} */}
              {issue.createdAt.toLocaleDateString()}

              <Avatar className="h-7 w-7">
                <AvatarImage
                  src={issue.creator?.avatarUrl ?? ""}
                  alt={issue.creator?.name + "avatar"}
                />
                <AvatarFallback>
                  {issue.creator?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {issue.creator?.avatarUrl}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IssuesList;