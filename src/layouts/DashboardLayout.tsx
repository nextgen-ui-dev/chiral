import { Icon } from "@iconify/react";
import axios from "axios";
import {
  Briefcase,
  Check,
  ChevronsUpDown,
  Files,
  LogOut,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/utils/api";
import { LoadingHero } from "./LoadingHero";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { data: sessionData, isLoading: sessionLoading } =
    api.user.getSessionInfo.useQuery();
  const { data: user, isLoading } = api.user.getCurrentUser.useQuery();
  const { data: workspace, isLoading: workspaceLoading } =
    api.workspace.getCurrentWorkspace.useQuery();

  // Typescript seems to fail to infer the type sometimes
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data: teamsData, isLoading: teamsLoading } =
    api.workspace.linear.getTeams.useQuery(); // eslint-disable-line @typescript-eslint/no-unsafe-call
  const { data, isLoading: workspacesLoading } =
    api.workspace.getWorkspaceSessions.useQuery();

  const setWorkspaceSession = async (
    workspaceId: string,
    sessionId: string,
  ) => {
    await axios.post("/api/auth/update-session", { sessionId, workspaceId });
    await router.push("/" + workspaceId);
    router.reload();
  };

  return isLoading || workspaceLoading || sessionLoading || teamsLoading ? (
    <LoadingHero />
  ) : (
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
            <hr className="my-2 border-primary" />
            <p className="pl-1 text-xs text-slate-300">Workspaces</p>
            {!workspacesLoading && (
              <ul>
                {data?.map((ws) => {
                  const now = Date.now();
                  const expired =
                    ws.sessions === null || ws.sessions.activeExpires < now;
                  const workspaceId =
                    ws.workspaces.providerId +
                    ":" +
                    ws.workspaces.providerWorkspaceId;
                  const activeWsId =
                    workspace?.providerId +
                    ":" +
                    workspace?.providerWorkspaceId;

                  return expired ? (
                    <a
                      key={workspaceId}
                      href={
                        "/api/auth/login/" +
                        ws.workspaces.providerId +
                        "?prompt=consent"
                      }
                    >
                      <li
                        key={workspaceId}
                        className="flex flex-row items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-primary"
                      >
                        <p>{ws.workspaces.name}</p>
                        {expired && (
                          <p className="text-xs">Session timed out</p>
                        )}
                      </li>
                    </a>
                  ) : (
                    <li key={workspaceId}>
                      <button
                        onClick={() =>
                          void setWorkspaceSession(
                            workspaceId,
                            sessionData!.session!.id,
                          )
                        }
                        className="flex w-full flex-row items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-primary"
                      >
                        <p>{ws.workspaces.name}</p>
                        {workspaceId === activeWsId && <Check size={16} />}
                        {expired && (
                          <p className="text-xs">Session timed out</p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <hr className="my-2 border-primary" />
            <p className="pl-1 text-xs text-slate-300">Manage Workspace</p>
            <Link href="/api/auth/login/linear?prompt=consent">
              <button
                type="submit"
                className="flex w-full flex-row items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-primary"
              >
                <Icon icon="mingcute:linear-fill" fontSize={16} />
                <p>Add Linear Workspace</p>
              </button>
            </Link>
            <hr className="my-2 border-primary" />
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex w-full flex-row items-center gap-2 rounded-md px-2 py-1 text-sm text-red-600 hover:bg-primary"
              >
                <LogOut size={16} />
                <p>Sign Out</p>
              </button>
            </form>
          </PopoverContent>
        </Popover>
        <div className="scroll-m- max-h-full w-full overflow-y-auto">
          <p className="mb-2 mt-4 pl-1 text-xs text-slate-300">My Teams</p>
          <ul>
            {teamsData?.teams.map((team) => {
              return (
                <li key={team.id}>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex h-auto w-full flex-row items-center justify-between p-2 hover:bg-primary"
                      >
                        <p className="text-sm font-semibold">{team.name}</p>
                        <ChevronsUpDown size={16} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="text-sm">
                      <ul className="ml-2 border-l-2 border-l-primary-dark pl-2">
                        <li>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex h-auto w-full flex-row items-center justify-start gap-2 p-2 hover:bg-primary"
                          >
                            <Ticket size={16} />
                            <p className="font-semibold">Issues</p>
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex h-auto w-full flex-row items-center justify-start gap-2 p-2 hover:bg-primary"
                          >
                            <Briefcase size={16} />
                            <p className="font-semibold">Projects</p>
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex h-auto w-full flex-row items-center justify-start gap-2 p-2 hover:bg-primary"
                          >
                            <Files size={16} />
                            <p className="font-semibold">Documents</p>
                          </Button>
                        </li>
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      <main className="w-full">{children}</main>
    </div>
  );
};
