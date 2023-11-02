import React from "react";
import Router, { useRouter } from "next/router";
import { Issue, User, Project } from "@linear/sdk";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import PriorityBar from "./PriorityBar";
// import IssueRowItem from "./IssueRowItem";

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
  const router = useRouter();
  const [workspaceId] = router.asPath
  .replace("/", "")
  .replace("/documents", "")
  .split("/");
  console.log("Issues", issues);

  
  return (
    <div className="flex flex-col gap-y-4">
      {issues?.map(issue => {
        if (issue.trashed) {
         return;
        }

        return (
          <div 
            key={issue.id}
            onClick={() => router.push(`/${workspaceId}/generate/${issue.id}`)}
            className={"w-full text-sm rounded-none rounded-b-none px-4 py-2 min-h-[40px] flex flex-row border-b border-opacity-50 border-gray-500 hover:bg-gray-500 hover:bg-opacity-20 text-white font-semibold justify-between items-center hover:cursor-pointer"}
          >
            <div className="flex flex-row gap-x-4 items-center">
              <PriorityBar priorityLevel={issue.priority} />

              <div>
                {issue.identifier}
              </div>

              <div>
                {issue.title}
              </div>
            </div>
            <div className="flex flex-row gap-x-4 items-center">
              <div className={`${issue.project?.name && "border border-gray-400 border-opacity-25 py-2 px-3 rounded-full"}`}>
                {issue.project?.name}
              </div>
              <div title={`Due ${new Date(issue.dueDate as string).toLocaleDateString()}`} className={`${issue.dueDate && "border border-gray-400 border-opacity-25 p-2 rounded-full"}`}>
                {issue.dueDate as string}
              </div>
              <div title={`Created ${issue.createdAt.toLocaleDateString()}, ${issue.createdAt.toLocaleTimeString()}`} className={``}>
                {/* {new Date(issue.dueDate as string).toLocaleDateString()} */}
                {issue.createdAt.toLocaleDateString()}
              </div>

              <Avatar className="h-8 w-8">
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