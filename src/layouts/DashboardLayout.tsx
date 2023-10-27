import { useRouter } from "next/router";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/utils/api";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { data: user, isLoading } = api.user.getCurrentUser.useQuery();
  const { data: workspace, isLoading: workspaceLoading } =
    api.workspace.getCurrentWorkspace.useQuery();

  const { data, isLoading: workspacesLoading } =
    api.workspace.getWorkspaceSessions.useQuery();

  return (
    !isLoading &&
    !workspaceLoading && (
      <div className="flex min-h-screen w-full flex-row">
        <nav className="min-h-screen min-w-[20rem] max-w-xs overflow-x-clip border-r-[1px] border-solid border-primary-dark p-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                className="flex flex-row gap-2 px-2 hover:bg-primary-dark"
                variant="ghost"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={user?.avatar_url ?? ""}
                    alt={user?.name + "avatar"}
                  />
                  <AvatarFallback>
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {workspace?.name}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="ml-4 mt-2 p-2">
              <p className="text-sm text-slate-300">{user?.name}</p>
              <p className="text-xs text-slate-300">{user?.email}</p>
              <hr className="my-4 border-primary" />
              {!workspacesLoading && (
                <ul>
                  {data?.map((ws) => {
                    const expired = ws.sessions === null;
                    const workspaceId =
                      ws.workspaces.providerId +
                      ":" +
                      ws.workspaces.providerWorkspaceId;

                    return (
                      <li
                        onClick={() => {
                          if (expired) {
                            void router.push(
                              "/api/auth/login/" +
                                ws.workspaces.providerId +
                                "?prompt=consent",
                            );
                          } else {
                          }
                        }}
                        key={workspaceId}
                        className="flex flex-row items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-primary"
                      >
                        <p>{ws.workspaces.name}</p>
                        {expired && (
                          <p className="text-xs">Session timed out</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </PopoverContent>
          </Popover>
        </nav>
        <main className="w-full">{children}</main>
      </div>
    )
  );
};
