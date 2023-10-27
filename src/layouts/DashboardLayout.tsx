import React from "react";
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
  const { data: user, isLoading } = api.user.getCurrentUser.useQuery();
  const { data: workspace, isLoading: workspaceLoading } =
    api.workspace.getCurrentWorkspace.useQuery();

  return (
    !isLoading &&
    !workspaceLoading && (
      <div className="flex min-h-screen w-full flex-row">
        <nav className="min-h-screen min-w-[20rem] max-w-xs overflow-x-clip border-r-[1px] border-solid border-primary-dark p-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" className="px-2" variant="ghost">
                {workspace?.name}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="ml-4 mt-2 p-2">
              <p className="text-sm text-slate-300">{user?.name}</p>
              <p className="text-xs text-slate-300">{user?.email}</p>
            </PopoverContent>
          </Popover>
        </nav>
        <main className="w-full">{children}</main>
      </div>
    )
  );
};
