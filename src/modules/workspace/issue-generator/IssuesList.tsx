import React, { useState } from "react";
import { useRouter } from "next/router";
import type { User, Project } from "@linear/sdk";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import PriorityBar from "./PriorityBar";
import { IssueDialog } from "./IssueDialog";

// type IssueData = Pick<Issue, "id" | "priority" | "identifier" | "title" 
//                       | "dueDate" | "createdAt" | "trashed"> & {
//   creator: User | undefined;
//   project: Project | undefined;
// }

const getPriorityLevel = (pr: string) => {
  const pl = pr.toLowerCase();
  if (pl === "urgent") {
    return 1;
  }

  if (pl === "high") {
    return 2;
  }

  if (pl === "medium") {
    return 3;
  }

  return 4;
}

export type IssueData = {
  id?: number;
  title: string;
  description: string; 
  priority: string;
  trashed?: string;
  identifier?: string;
  dueDate?: Date;
  createdAt?: Date;
  project?: Project;
  creator?: User;
}

export const IssuesList: React.FC<{ issues: IssueData[]}> = ({
  issues
}) => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogData, setDialogData] = useState<IssueData>();

  const router = useRouter();
  const [workspaceId] = router.asPath
  .replace("/", "")
  .replace("/documents", "")
  .split("/");
  console.log("Issues", issues);

  return (
    <div className="flex flex-col gap-y-2">
      {issues?.map((issue) => {
        if (issue.trashed) {
          return;
        }

        const priorityLevel = getPriorityLevel(issue.priority);

        return (
          <div 
            key={issue.id}
            // onClick={() => router.push(`/${workspaceId}/generate/${issue.id}`)}
            className={"w-full text-sm rounded-none rounded-b-none px-4 py-2 min-h-[40px] flex flex-row border-b border-opacity-50 border-gray-500 hover:bg-gray-500 hover:bg-opacity-20 text-white font-semibold justify-between items-center hover:cursor-pointer"}
          >
            <div className="flex flex-row gap-x-4 items-center">
              <PriorityBar priorityLevel={priorityLevel} />

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
              <div title={`Due ${issue.dueDate ? new Date(issue.dueDate as unknown as string).toLocaleDateString() : "N/A"}`} className={`${issue.dueDate && "border border-gray-400 border-opacity-25 p-2 rounded-full"}`}>
                {issue.dueDate ? issue.dueDate as unknown as string : "N/A"}
              </div>
              <div 
                title={`Created ${issue.createdAt?.toLocaleDateString()}, ${issue.createdAt?.toLocaleTimeString()}`} 
                className={``}>
                {issue.createdAt?.toLocaleDateString()}
              </div>

              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={issue.creator?.avatarUrl ?? ""}
                  alt={issue.creator?.name + "avatar"}
                />
                <AvatarFallback>
                  {issue.creator ? issue.creator?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") : "Me"}
                </AvatarFallback>
              </Avatar>
              {issue.creator?.avatarUrl}

              <IssueDialog
                trigger="Edit"
                title={issue.title}
                dialogDesc={issue.description}
                issue={issue}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};